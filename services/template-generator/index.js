/**
 * Template Generator Service
 * Main application entry point
 */

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const config = require('./config/config');
const routes = require('./src/routes');
const { 
  loggingMiddleware, 
  errorMiddleware,
  validationMiddleware,
} = require('./src/middleware');

class Application {
  constructor() {
    this.app = express();
    this.server = null;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup application middleware
   */
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet(config.security.helmet));
    
    // CORS configuration
    this.app.use(cors(config.server.cors));
    
    // Compression middleware
    this.app.use(compression());
    
    // Trust proxy if behind reverse proxy
    if (config.server.trustProxy) {
      this.app.set('trust proxy', 1);
    }
    
    // Body parsing middleware
    this.app.use(express.json({ 
      limit: '10mb',
      type: ['application/json', 'text/plain'],
    }));
    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: '10mb',
    }));

    // Request correlation ID
    this.app.use(loggingMiddleware.correlationId);
    
    // HTTP request logging
    this.app.use(loggingMiddleware.httpLogger);
    
    // Request context logging (detailed)
    this.app.use(loggingMiddleware.requestLogger);
    
    // Input sanitization
    this.app.use(validationMiddleware.sanitizeInput);

    // API info endpoint
    this.app.get('/', (req, res) => {
      res.json({
        service: 'Template Generator Service',
        version: process.env.npm_package_version || '1.0.0',
        status: 'running',
        environment: config.environment,
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/health',
          api: '/api',
          templates: '/api/templates',
          docs: config.api.documentation.enabled ? config.api.documentation.path : null,
        },
        documentation: 'https://github.com/Krishna-kg732/docker_compose_generator',
      });
    });
  }

  /**
   * Setup application routes
   */
  setupRoutes() {
    // Mount all routes
    this.app.use('/', routes);
    
    // Handle 404 errors
    this.app.use(errorMiddleware.notFoundHandler);
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    // Error logging middleware
    this.app.use(loggingMiddleware.errorLogger);
    
    // Global error handler
    this.app.use(errorMiddleware.errorHandler);
  }

  /**
   * Connect to MongoDB
   */
  async connectDatabase() {
    try {
      loggingMiddleware.logger.info('Connecting to MongoDB...', {
        uri: config.database.mongodb.uri.replace(/\/\/.*@/, '//***:***@'), // Hide credentials
      });

      await mongoose.connect(config.database.mongodb.uri, config.database.mongodb.options);

      loggingMiddleware.logger.info('MongoDB connected successfully', {
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
      });

      // Handle MongoDB connection events
      mongoose.connection.on('error', (error) => {
        loggingMiddleware.logger.error('MongoDB connection error', { error: error.message });
      });

      mongoose.connection.on('disconnected', () => {
        loggingMiddleware.logger.warn('MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        loggingMiddleware.logger.info('MongoDB reconnected');
      });

    } catch (error) {
      loggingMiddleware.logger.error('MongoDB connection failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Start the server
   */
  async start() {
    try {
      // Connect to database first
      await this.connectDatabase();

      // Start HTTP server
      this.server = this.app.listen(config.server.port, config.server.host, () => {
        loggingMiddleware.logger.info('Server started successfully', {
          port: config.server.port,
          host: config.server.host,
          environment: config.environment,
          pid: process.pid,
          nodeVersion: process.version,
        });

        console.log(`
🚀 Template Generator Service Started!

Environment: ${config.environment}
Port: ${config.server.port}
Host: ${config.server.host}
Process ID: ${process.pid}

Health Check: http://${config.server.host}:${config.server.port}/health
API Endpoints: http://${config.server.host}:${config.server.port}/api
${config.api.documentation.enabled ? `Documentation: http://${config.server.host}:${config.server.port}${config.api.documentation.path}` : ''}

Ready to generate Docker Compose templates! 🐳
        `);
      });

      // Set server timeout
      this.server.timeout = 30000; // 30 seconds

      // Handle server errors
      this.server.on('error', (error) => {
        loggingMiddleware.logger.error('Server error', { error: error.message });
        throw error;
      });

    } catch (error) {
      loggingMiddleware.logger.error('Failed to start server', { error: error.message });
      console.error('Failed to start server:', error.message);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  async stop() {
    loggingMiddleware.logger.info('Shutting down server...');

    return new Promise((resolve) => {
      // Close HTTP server
      if (this.server) {
        this.server.close(() => {
          loggingMiddleware.logger.info('HTTP server closed');
          
          // Close database connection
          mongoose.connection.close(() => {
            loggingMiddleware.logger.info('MongoDB connection closed');
            resolve();
          });
        });
      } else {
        resolve();
      }
    });
  }
}

// Create application instance
const app = new Application();

// Handle process signals for graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await app.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await app.stop();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  loggingMiddleware.logger.error('Uncaught Exception', { 
    error: error.message, 
    stack: error.stack 
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  loggingMiddleware.logger.error('Unhandled Promise Rejection', { 
    reason: reason?.message || reason,
    stack: reason?.stack,
  });
  process.exit(1);
});

// Start the application
if (require.main === module) {
  app.start().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
  });
}

module.exports = app;