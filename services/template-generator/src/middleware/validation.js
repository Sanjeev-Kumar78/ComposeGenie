const { validationResult } = require('express-validator');

/**
 * Validation middleware to handle express-validator errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }
  
  next();
};

/**
 * Sanitize request data
 */
const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attacks
  const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
      return obj.trim()
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '');
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  next();
};

/**
 * Validate MongoDB ObjectId format
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const mongoose = require('mongoose');
    const id = req.params[paramName];
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`,
      });
    }
    
    next();
  };
};

/**
 * Validate file upload
 */
const validateFileUpload = (options = {}) => {
  const {
    allowedTypes = ['application/json', 'text/yaml', 'text/plain'],
    maxSize = 1024 * 1024, // 1MB default
    required = false,
  } = options;

  return (req, res, next) => {
    if (!req.files || !req.files.file) {
      if (required) {
        return res.status(400).json({
          success: false,
          message: 'File is required',
        });
      }
      return next();
    }

    const file = req.files.file;

    // Check file size
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB`,
      });
    }

    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({
      success: false,
      message: 'Page must be a positive integer',
    });
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be a positive integer between 1 and 100',
    });
  }
  
  req.pagination = {
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum,
  };
  
  next();
};

/**
 * Validate search query
 */
const validateSearch = (req, res, next) => {
  const { search } = req.query;
  
  if (search) {
    if (typeof search !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query must be a string',
      });
    }
    
    if (search.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long',
      });
    }
    
    if (search.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be less than 100 characters',
      });
    }
    
    // Sanitize search query for MongoDB regex
    req.sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  next();
};

module.exports = {
  handleValidationErrors,
  sanitizeInput,
  validateObjectId,
  validateFileUpload,
  validatePagination,
  validateSearch,
};