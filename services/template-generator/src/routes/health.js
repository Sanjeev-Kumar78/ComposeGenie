const express = require('express');
const { healthController } = require('../controllers');

const router = express.Router();

/**
 * @route   GET /health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', healthController.healthCheck);

/**
 * @route   GET /health/status
 * @desc    Detailed health status with dependencies
 * @access  Public
 */
router.get('/status', healthController.healthStatus);

/**
 * @route   GET /health/ready
 * @desc    Readiness probe for Kubernetes
 * @access  Public
 */
router.get('/ready', healthController.readiness);

/**
 * @route   GET /health/live
 * @desc    Liveness probe for Kubernetes
 * @access  Public
 */
router.get('/live', healthController.liveness);

module.exports = router;