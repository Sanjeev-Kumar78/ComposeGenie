const { Template, User } = require('../models');
const handlebars = require('handlebars');
const { TemplateError } = require('../middleware/errorHandler');
const { logger } = require('../middleware/logging');

/**
 * Template Service
 * Handles business logic for template operations
 */
class TemplateService {
  /**
   * Get all templates with pagination and filtering
   */
  async getAllTemplates(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options;

      const filter = { isPublic: true, isActive: true };

      // Add category filter
      if (category) {
        filter.category = category;
      }

      // Add search filter
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ];
      }

      const skip = (page - 1) * limit;
      const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const [templates, total] = await Promise.all([
        Template.find(filter)
          .select('-templateContent') // Don't include full template content in list
          .populate('createdBy', 'username firstName lastName')
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        Template.countDocuments(filter),
      ]);

      return {
        templates,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error('Error getting templates', { error: error.message });
      throw error;
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(id) {
    try {
      const template = await Template.findById(id)
        .populate('createdBy', 'username firstName lastName profile')
        .lean();

      if (!template || !template.isPublic || !template.isActive) {
        return null;
      }

      // Increment download count (async, don't wait)
      Template.findByIdAndUpdate(id, { 
        $inc: { 'usage.downloadCount': 1 },
        $set: { 'usage.lastUsed': new Date() },
      }).exec();

      return template;
    } catch (error) {
      logger.error('Error getting template by ID', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Create new template
   */
  async createTemplate(templateData) {
    try {
      // Validate template content
      await this.validateTemplateContent(templateData.templateContent);

      const template = new Template({
        ...templateData,
        createdBy: templateData.createdBy,
      });

      const savedTemplate = await template.save();
      
      // Update user statistics (async, don't wait)
      User.findByIdAndUpdate(templateData.createdBy, {
        $inc: { 'statistics.templatesCreated': 1 },
      }).exec();

      logger.info('Template created', { templateId: savedTemplate._id });
      return savedTemplate;
    } catch (error) {
      logger.error('Error creating template', { error: error.message });
      throw error;
    }
  }

  /**
   * Update template
   */
  async updateTemplate(id, updateData) {
    try {
      // If updating template content, validate it
      if (updateData.templateContent) {
        await this.validateTemplateContent(updateData.templateContent);
      }

      const template = await Template.findByIdAndUpdate(
        id,
        { 
          ...updateData,
          updatedBy: updateData.updatedBy,
        },
        { new: true, runValidators: true }
      ).populate('createdBy updatedBy', 'username firstName lastName');

      if (!template) {
        return null;
      }

      logger.info('Template updated', { templateId: id });
      return template;
    } catch (error) {
      logger.error('Error updating template', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(id) {
    try {
      const template = await Template.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      if (!template) {
        throw new TemplateError('Template not found');
      }

      logger.info('Template deleted (soft delete)', { templateId: id });
      return template;
    } catch (error) {
      logger.error('Error deleting template', { id, error: error.message });
      throw error;
    }
  }

  /**
   * Generate Docker Compose from template
   */
  async generateDockerCompose(templateId, variables = {}) {
    try {
      const template = await Template.findById(templateId);

      if (!template || !template.isPublic || !template.isActive) {
        throw new TemplateError('Template not found or not accessible');
      }

      // Validate variables against template requirements
      this.validateTemplateVariables(template, variables);

      // Compile Handlebars template
      const compiledTemplate = handlebars.compile(template.templateContent);
      
      // Generate Docker Compose content
      const dockerCompose = compiledTemplate(variables);

      // Validate generated YAML
      await this.validateDockerComposeYaml(dockerCompose);

      // Increment usage statistics (async, don't wait)
      template.incrementDownloadCount();

      logger.info('Docker Compose generated', { templateId });
      
      return dockerCompose;
    } catch (error) {
      logger.error('Error generating Docker Compose', { 
        templateId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Validate template configuration
   */
  async validateTemplate(templateId, variables = {}) {
    try {
      const template = await Template.findById(templateId);

      if (!template || !template.isPublic || !template.isActive) {
        throw new TemplateError('Template not found or not accessible');
      }

      const validation = {
        isValid: true,
        errors: [],
        warnings: [],
      };

      // Validate required variables
      const missingVariables = template.variables
        .filter(variable => variable.required && !(variable.name in variables))
        .map(variable => variable.name);

      if (missingVariables.length > 0) {
        validation.isValid = false;
        validation.errors.push({
          type: 'missing_variables',
          message: 'Required variables are missing',
          details: missingVariables,
        });
      }

      // Validate variable types and constraints
      for (const variable of template.variables) {
        if (variable.name in variables) {
          const value = variables[variable.name];
          const variableValidation = this.validateVariable(variable, value);
          
          if (!variableValidation.isValid) {
            validation.isValid = false;
            validation.errors.push({
              type: 'invalid_variable',
              variable: variable.name,
              message: variableValidation.message,
            });
          }
        }
      }

      // Try to compile template if no errors
      if (validation.isValid) {
        try {
          const compiledTemplate = handlebars.compile(template.templateContent);
          const dockerCompose = compiledTemplate(variables);
          await this.validateDockerComposeYaml(dockerCompose);
        } catch (error) {
          validation.isValid = false;
          validation.errors.push({
            type: 'template_compilation',
            message: 'Template compilation failed',
            details: error.message,
          });
        }
      }

      return validation;
    } catch (error) {
      logger.error('Error validating template', { 
        templateId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Validate template content (Handlebars syntax)
   */
  async validateTemplateContent(templateContent) {
    try {
      // Try to compile the Handlebars template
      handlebars.compile(templateContent);
      return true;
    } catch (error) {
      throw new TemplateError(
        'Invalid template syntax',
        `Handlebars compilation error: ${error.message}`
      );
    }
  }

  /**
   * Validate template variables
   */
  validateTemplateVariables(template, variables) {
    const errors = [];

    // Check required variables
    for (const variable of template.variables) {
      if (variable.required && !(variable.name in variables)) {
        errors.push(`Required variable '${variable.name}' is missing`);
      }
    }

    if (errors.length > 0) {
      throw new TemplateError('Variable validation failed', errors);
    }
  }

  /**
   * Validate individual variable
   */
  validateVariable(variableConfig, value) {
    const { type, validation = {} } = variableConfig;
    
    // Type validation
    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          return { isValid: false, message: 'Must be a string' };
        }
        
        if (validation.minLength && value.length < validation.minLength) {
          return { 
            isValid: false, 
            message: `Must be at least ${validation.minLength} characters` 
          };
        }
        
        if (validation.maxLength && value.length > validation.maxLength) {
          return { 
            isValid: false, 
            message: `Must be no more than ${validation.maxLength} characters` 
          };
        }
        
        if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
          return { isValid: false, message: 'Invalid format' };
        }
        
        if (validation.enum && !validation.enum.includes(value)) {
          return { 
            isValid: false, 
            message: `Must be one of: ${validation.enum.join(', ')}` 
          };
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return { isValid: false, message: 'Must be a valid number' };
        }
        
        if (validation.minimum !== undefined && value < validation.minimum) {
          return { 
            isValid: false, 
            message: `Must be at least ${validation.minimum}` 
          };
        }
        
        if (validation.maximum !== undefined && value > validation.maximum) {
          return { 
            isValid: false, 
            message: `Must be no more than ${validation.maximum}` 
          };
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          return { isValid: false, message: 'Must be true or false' };
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          return { isValid: false, message: 'Must be an array' };
        }
        break;

      case 'object':
        if (typeof value !== 'object' || Array.isArray(value) || value === null) {
          return { isValid: false, message: 'Must be an object' };
        }
        break;
    }

    return { isValid: true };
  }

  /**
   * Validate Docker Compose YAML
   */
  async validateDockerComposeYaml(yamlContent) {
    try {
      const yaml = require('js-yaml');
      const parsed = yaml.load(yamlContent);
      
      // Basic Docker Compose structure validation
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid YAML structure');
      }

      if (!parsed.version && !parsed.services) {
        throw new Error('Missing required Docker Compose fields (version or services)');
      }

      return true;
    } catch (error) {
      throw new TemplateError(
        'Invalid Docker Compose YAML',
        error.message
      );
    }
  }

  /**
   * Search templates
   */
  async searchTemplates(searchTerm, options = {}) {
    try {
      const templates = await Template.search(searchTerm)
        .populate('createdBy', 'username firstName lastName')
        .sort({ 'usage.rating.average': -1, 'usage.downloadCount': -1 })
        .limit(options.limit || 20)
        .lean();

      return templates;
    } catch (error) {
      logger.error('Error searching templates', { searchTerm, error: error.message });
      throw error;
    }
  }

  /**
   * Get popular templates
   */
  async getPopularTemplates(limit = 10) {
    try {
      const templates = await Template.findPopular(limit);
      return templates;
    } catch (error) {
      logger.error('Error getting popular templates', { error: error.message });
      throw error;
    }
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category) {
    try {
      const templates = await Template.findByCategory(category)
        .populate('createdBy', 'username firstName lastName')
        .sort({ 'usage.rating.average': -1 })
        .lean();

      return templates;
    } catch (error) {
      logger.error('Error getting templates by category', { category, error: error.message });
      throw error;
    }
  }
}

module.exports = new TemplateService();