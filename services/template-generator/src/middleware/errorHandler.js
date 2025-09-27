/**
 * Global error handler middleware
 */
const errorHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = null;

  // MongoDB/Mongoose errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value,
    }));
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
    const field = Object.keys(error.keyValue)[0];
    details = `${field} '${error.keyValue[field]}' already exists`;
  }
  
  // JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  
  // Custom application errors
  else if (error.statusCode) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  }
  
  // Template generation errors
  else if (error.name === 'TemplateError') {
    statusCode = 400;
    message = error.message;
    details = error.details;
  }
  
  // Docker-related errors
  else if (error.name === 'DockerError') {
    statusCode = 502;
    message = 'Docker service error';
    details = error.message;
  }

  // Log error for server errors
  if (statusCode >= 500) {
    console.error('Server error:', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
    });
  }

  // Don't expose sensitive information in production
  const response = {
    success: false,
    message,
    ...(details && { details }),
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Handle 404 errors for routes that don't exist
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Custom error class for template-related errors
 */
class TemplateError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'TemplateError';
    this.details = details;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Custom error class for Docker-related errors
 */
class DockerError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'DockerError';
    this.originalError = originalError;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  TemplateError,
  DockerError,
};