const express = require('express');
const templateRoutes = require('./templates');
const healthRoutes = require('./health');

const router = express.Router();

// API Routes
router.use('/api/templates', templateRoutes);
router.use('/health', healthRoutes);

// API Info endpoint
router.get('/api', (req, res) => {
  res.json({
    service: 'Template Generator Service',
    version: process.env.npm_package_version || '1.0.0',
    description: 'A microservice for managing and generating Docker Compose templates',
    endpoints: {
      templates: '/api/templates',
      health: '/health',
      docs: '/api/docs',
    },
    documentation: process.env.API_DOCS_URL || 'http://localhost:3000/api/docs',
  });
});

// Handle 404 for API routes
router.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
  });
});

module.exports = router;