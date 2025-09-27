/**
 * Template Generator Service
 * Main application entry point
 */

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./src/routes');
const { errorHandler } = require('./src/middleware/errorHandler');

// Simple configuration for MVP
const config = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/template-generator-dev',
  jwtSecret: process.env.JWT_SECRET || 'your-fallback-jwt-secret',
  environment: process.env.NODE_ENV || 'development',
};

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
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: config.environment === 'development' ? true : false,
      credentials: true,
    }));
    

    
    // HTTP request logging
    this.app.use(morgan('combined'));
    
    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    


    // API info endpoint
    this.app.get('/', (req, res) => {
      res.json({
        service: 'Template Generator Service',
        version: '1.0.0',
        status: 'running',
        environment: config.environment,
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/health',
          api: '/api',
          templates: '/api/templates',
        },
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
    this.app.use('*', (req, res) => {
      res.status(404).json({ success: false, message: 'Route not found' });
    });
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    // Global error handler
    this.app.use(errorHandler);
  }

  /**
   * Connect to MongoDB
   */
  async connectDatabase() {
    try {
      console.log('Connecting to MongoDB...');
      
      await mongoose.connect(config.mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log('MongoDB connected successfully');

      // Handle MongoDB connection events
      mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error.message);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected');
      });

    } catch (error) {
      console.error('MongoDB connection failed:', error.message);
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
      this.server = this.app.listen(config.port, config.host, () => {
        console.log(`
🚀 Template Generator Service Started!

Environment: ${config.environment}
Port: ${config.port}
Host: ${config.host}
Process ID: ${process.pid}

Health Check: http://${config.host}:${config.port}/health
API Endpoints: http://${config.host}:${config.port}/api

Ready to generate Docker Compose templates! 🐳
        `);
      });

      // Handle server errors
      this.server.on('error', (error) => {
        console.error('Server error:', error.message);
        throw error;
      });

    } catch (error) {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  async stop() {
    console.log('Shutting down server...');

    return new Promise((resolve) => {
      // Close HTTP server
      if (this.server) {
        this.server.close(() => {
          console.log('HTTP server closed');
          
          // Close database connection
          mongoose.connection.close(() => {
            console.log('MongoDB connection closed');
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
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
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