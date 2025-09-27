const templateService = require('../services/templateService');

/**
 * Template Controller - Simplified for MVP
 */
class TemplateController {
  /**
   * Get all templates
   */
  async getAllTemplates(req, res) {
    try {
      const templates = await templateService.getAllTemplates();
      res.json({ success: true, data: templates });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(req, res) {
    try {
      const template = await templateService.getTemplateById(req.params.id);
      if (!template) {
        return res.status(404).json({ success: false, message: 'Template not found' });
      }
      res.json({ success: true, data: template });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Create new template
   */
  async createTemplate(req, res) {
    try {
      const template = await templateService.createTemplate(req.body);
      res.status(201).json({ success: true, data: template });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Update template
   */
  async updateTemplate(req, res) {
    try {
      const template = await templateService.updateTemplate(req.params.id, req.body);
      if (!template) {
        return res.status(404).json({ success: false, message: 'Template not found' });
      }
      res.json({ success: true, data: template });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(req, res) {
    try {
      await templateService.deleteTemplate(req.params.id);
      res.json({ success: true, message: 'Template deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Generate Docker Compose from template
   */
  async generateCompose(req, res) {
    try {
      const { id } = req.params;
      const { variables } = req.body;
      const dockerCompose = await templateService.generateDockerCompose(id, variables);
      res.json({ success: true, data: { dockerCompose } });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new TemplateController();