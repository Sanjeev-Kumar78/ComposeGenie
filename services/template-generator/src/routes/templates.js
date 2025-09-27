const express = require('express');
const { body, param, query } = require('express-validator');
const { templateController } = require('../controllers');
const { authMiddleware, validationMiddleware } = require('../middleware');

const router = express.Router();

// Validation rules
const templateValidation = {
  create: [
    body('name')
      .notEmpty()
      .withMessage('Template name is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Template name must be between 3 and 100 characters'),
    body('description')
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ min: 10, max: 500 })
      .withMessage('Description must be between 10 and 500 characters'),
    body('category')
      .isIn([
        'web-application',
        'database',
        'messaging',
        'monitoring',
        'ci-cd',
        'development',
        'production',
        'microservices',
        'data-processing',
        'security',
      ])
      .withMessage('Invalid category'),
    body('templateContent')
      .notEmpty()
      .withMessage('Template content is required'),
    body('variables')
      .optional()
      .isArray()
      .withMessage('Variables must be an array'),
    body('variables.*.name')
      .if(body('variables').exists())
      .notEmpty()
      .withMessage('Variable name is required'),
    body('variables.*.type')
      .if(body('variables').exists())
      .isIn(['string', 'number', 'boolean', 'array', 'object'])
      .withMessage('Invalid variable type'),
    body('variables.*.description')
      .if(body('variables').exists())
      .notEmpty()
      .withMessage('Variable description is required'),
    body('metadata.author')
      .notEmpty()
      .withMessage('Author is required'),
    body('metadata.authorEmail')
      .optional()
      .isEmail()
      .withMessage('Invalid email format'),
  ],
  update: [
    param('id').isMongoId().withMessage('Invalid template ID'),
    body('name')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Template name must be between 3 and 100 characters'),
    body('description')
      .optional()
      .isLength({ min: 10, max: 500 })
      .withMessage('Description must be between 10 and 500 characters'),
    body('category')
      .optional()
      .isIn([
        'web-application',
        'database',
        'messaging',
        'monitoring',
        'ci-cd',
        'development',
        'production',
        'microservices',
        'data-processing',
        'security',
      ])
      .withMessage('Invalid category'),
  ],
  generateCompose: [
    param('id').isMongoId().withMessage('Invalid template ID'),
    body('variables')
      .optional()
      .isObject()
      .withMessage('Variables must be an object'),
  ],
  validateTemplate: [
    param('id').isMongoId().withMessage('Invalid template ID'),
    body('variables')
      .optional()
      .isObject()
      .withMessage('Variables must be an object'),
  ],
};

const queryValidation = {
  getAll: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('category')
      .optional()
      .isIn([
        'web-application',
        'database',
        'messaging',
        'monitoring',
        'ci-cd',
        'development',
        'production',
        'microservices',
        'data-processing',
        'security',
      ])
      .withMessage('Invalid category'),
    query('search')
      .optional()
      .isLength({ min: 2 })
      .withMessage('Search term must be at least 2 characters'),
  ],
  getById: [
    param('id').isMongoId().withMessage('Invalid template ID'),
  ],
};

// Routes

/**
 * @route   GET /api/templates
 * @desc    Get all templates with pagination and filtering
 * @access  Public
 */
router.get('/', queryValidation.getAll, templateController.getAllTemplates);

/**
 * @route   GET /api/templates/:id
 * @desc    Get template by ID
 * @access  Public
 */
router.get('/:id', queryValidation.getById, templateController.getTemplateById);

/**
 * @route   POST /api/templates
 * @desc    Create new template
 * @access  Private (requires authentication)
 */
router.post(
  '/',
  authMiddleware.requireAuth,
  templateValidation.create,
  templateController.createTemplate
);

/**
 * @route   PUT /api/templates/:id
 * @desc    Update template
 * @access  Private (requires authentication and ownership)
 */
router.put(
  '/:id',
  authMiddleware.requireAuth,
  authMiddleware.requireOwnership,
  templateValidation.update,
  templateController.updateTemplate
);

/**
 * @route   DELETE /api/templates/:id
 * @desc    Delete template
 * @access  Private (requires authentication and ownership or admin)
 */
router.delete(
  '/:id',
  authMiddleware.requireAuth,
  authMiddleware.requireOwnershipOrAdmin,
  queryValidation.getById,
  templateController.deleteTemplate
);

/**
 * @route   POST /api/templates/:id/generate
 * @desc    Generate Docker Compose from template
 * @access  Public
 */
router.post(
  '/:id/generate',
  templateValidation.generateCompose,
  templateController.generateCompose
);

/**
 * @route   POST /api/templates/:id/validate
 * @desc    Validate template configuration
 * @access  Public
 */
router.post(
  '/:id/validate',
  templateValidation.validateTemplate,
  templateController.validateTemplate
);

module.exports = router;