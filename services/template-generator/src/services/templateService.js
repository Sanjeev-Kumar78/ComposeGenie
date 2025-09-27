const { Template } = require('../models');
const handlebars = require('handlebars');

/**
 * Simplified Template Service for MVP
 */
class TemplateService {
  /**
   * Get all templates
   */
  async getAllTemplates() {
    try {
      const templates = await Template.find({ isActive: true })
        .select('name description category createdAt')
        .lean();
      return templates;
    } catch (error) {
      console.error('Error getting templates:', error.message);
      throw error;
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(id) {
    try {
      const template = await Template.findById(id).lean();
      if (!template || !template.isActive) {
        return null;
      }
      return template;
    } catch (error) {
      console.error('Error getting template by ID:', id, error.message);
      throw error;
    }
  }

  /**
   * Create new template
   */
  async createTemplate(templateData) {
    try {
      const template = new Template(templateData);
      const savedTemplate = await template.save();
      console.log('Template created:', savedTemplate._id);
      return savedTemplate;
    } catch (error) {
      console.error('Error creating template:', error.message);
      throw error;
    }
  }

  /**
   * Update template
   */
  async updateTemplate(id, templateData) {
    try {
      const template = await Template.findByIdAndUpdate(id, templateData, {
        new: true,
        runValidators: true,
      });
      
      if (!template) {
        return null;
      }

      console.log('Template updated:', id);
      return template;
    } catch (error) {
      console.error('Error updating template:', id, error.message);
      throw error;
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(id) {
    try {
      const template = await Template.findByIdAndUpdate(id, { isActive: false });
      
      if (!template) {
        return null;
      }

      console.log('Template deleted (soft delete):', id);
      return template;
    } catch (error) {
      console.error('Error deleting template:', id, error.message);
      throw error;
    }
  }

  /**
   * Generate Docker Compose from template
   */
  async generateDockerCompose(templateId, variables = {}) {
    try {
      const template = await Template.findById(templateId);
      
      if (!template || !template.isActive) {
        throw new Error('Template not found');
      }

      // Compile Handlebars template
      const compiledTemplate = handlebars.compile(template.templateContent);
      const dockerCompose = compiledTemplate(variables);
      
      console.log('Docker Compose generated:', templateId);
      return dockerCompose;
    } catch (error) {
      console.error('Error generating Docker Compose:', templateId, error.message);
      throw error;
    }
  }
}

module.exports = new TemplateService();