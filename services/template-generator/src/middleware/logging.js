const morgan = require('morgan');
const winston = require('winston');

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'template-generator',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Write all logs with level `error` and below to `error.log`
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level `info` and below to `combined.log`
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

// Custom Morgan token for user ID
morgan.token('userId', (req) => {
  return req.user ? req.user._id : 'anonymous';
});

// Custom Morgan token for correlation ID
morgan.token('correlationId', (req) => {
  return req.correlationId || 'none';
});

// HTTP request logging middleware
const httpLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms - User: :userId - Correlation: :correlationId',
  {
    stream: {
      write: (message) => {
        logger.info(message.trim(), { type: 'http_request' });
      },
    },
  }
);

// Error logging middleware
const errorLogger = (error, req, res, next) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user._id : null,
    correlationId: req.correlationId,
    body: req.body,
    params: req.params,
    query: req.query,
  };

  logger.error('Request error', errorInfo);
  next(error);
};

// Request correlation ID middleware
const correlationId = (req, res, next) => {
  req.correlationId = req.get('X-Correlation-ID') || 
    req.get('X-Request-ID') || 
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  res.set('X-Correlation-ID', req.correlationId);
  next();
};

// Request context logger
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request start
  logger.info('Request started', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user._id : null,
    correlationId: req.correlationId,
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      contentLength: res.get('content-length') || 0,
      userId: req.user ? req.user._id : null,
      correlationId: req.correlationId,
    });

    originalEnd.call(res, chunk, encoding);
  };

  next();
};

module.exports = {
  logger,
  httpLogger,
  errorLogger,
  correlationId,
  requestLogger,
};