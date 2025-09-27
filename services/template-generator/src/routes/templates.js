const express = require('express');
const { templateController } = require('../controllers');
const { requireAuth } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');

const router = express.Router();

// Simplified routes for MVP
router.get('/', templateController.getAllTemplates);
router.get('/:id', validateObjectId, templateController.getTemplateById);
router.post('/', requireAuth, templateController.createTemplate);
router.put('/:id', requireAuth, validateObjectId, templateController.updateTemplate);
router.delete('/:id', requireAuth, validateObjectId, templateController.deleteTemplate);
router.post('/:id/generate', validateObjectId, templateController.generateCompose);

module.exports = router;