const templateService = require('../services/templateService');
const { validationResult } = require('express-validator');

/**
 * Template Controller
 * Handles HTTP requests for template operations
 */
class TemplateController {
  /**
   * Get all templates
   */
  async getAllTemplates(req, res, next) {
    try {
      const { page = 1, limit = 10, category, search } = req.query;
      const templates = await templateService.getAllTemplates({
        page: parseInt(page),
        limit: parseInt(limit),
        category,
        search,
      });

      res.json({
        success: true,
        data: templates,
        message: 'Templates retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(req, res, next) {
    try {
      const { id } = req.params;
      const template = await templateService.getTemplateById(id);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found',
        });
      }

      res.json({
        success: true,
        data: template,
        message: 'Template retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new template
   */
  async createTemplate(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const template = await templateService.createTemplate(req.body);
      
      res.status(201).json({
        success: true,
        data: template,
        message: 'Template created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update template
   */
  async updateTemplate(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const template = await templateService.updateTemplate(id, req.body);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found',
        });
      }

      res.json({
        success: true,
        data: template,
        message: 'Template updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(req, res, next) {
    try {
      const { id } = req.params;
      await templateService.deleteTemplate(id);

      res.json({
        success: true,
        message: 'Template deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate Docker Compose from template
   */
  async generateCompose(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { variables } = req.body;

      const dockerCompose = await templateService.generateDockerCompose(id, variables);

      res.json({
        success: true,
        data: {
          dockerCompose,
        },
        message: 'Docker Compose generated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate template configuration
   */
  async validateTemplate(req, res, next) {
    try {
      const { id } = req.params;
      const { variables } = req.body;

      const validation = await templateService.validateTemplate(id, variables);

      res.json({
        success: true,
        data: validation,
        message: 'Template validation completed',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TemplateController();