const express = require('express');
const { healthController } = require('../controllers');

const router = express.Router();

// Simplified health route for MVP
router.get('/', healthController.healthCheck);

module.exports = router;