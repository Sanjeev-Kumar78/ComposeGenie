/**
 * Application Configuration
 * Centralized configuration management for the template generator service
 */

const path = require('path');

class Config {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.loadConfig();
  }

  loadConfig() {
    // Server Configuration
    this.server = {
      port: parseInt(process.env.PORT) || 3000,
      host: process.env.HOST || '0.0.0.0',
      cors: {
        origin: this.getCorsOrigins(),
        credentials: true,
      },
      trustProxy: process.env.TRUST_PROXY === 'true',
    };

    // Database Configuration
    this.database = {
      mongodb: {
        uri: process.env.MONGODB_URI || this.getDefaultMongoUri(),
        options: {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
          serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_TIMEOUT) || 5000,
          socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
          retryWrites: true,
          w: 'majority',
        },
      },
    };

    // Redis Configuration (for caching and sessions)
    this.redis = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB) || 0,
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'template-generator:',
    };

    // JWT Configuration
    this.jwt = {
      secret: process.env.JWT_SECRET || this.generateFallbackSecret(),
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: process.env.JWT_ISSUER || 'template-generator-service',
      audience: process.env.JWT_AUDIENCE || 'template-generator-users',
    };

    // Security Configuration
    this.security = {
      bcrypt: {
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
      },
      rateLimiting: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX) || 100,
      },
      helmet: {
        contentSecurityPolicy: process.env.NODE_ENV === 'production',
        crossOriginEmbedderPolicy: false,
      },
    };

    // File Upload Configuration
    this.fileUpload = {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 1024 * 1024, // 1MB
      allowedMimeTypes: [
        'application/json',
        'text/yaml',
        'application/yaml',
        'text/plain',
      ],
      uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'),
    };

    // Logging Configuration
    this.logging = {
      level: process.env.LOG_LEVEL || 'info',
      file: {
        enabled: process.env.LOG_TO_FILE !== 'false',
        directory: process.env.LOG_DIR || path.join(__dirname, '../../logs'),
        maxSize: process.env.LOG_MAX_SIZE || '20m',
        maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
      },
      console: {
        enabled: this.environment !== 'production' || process.env.LOG_TO_CONSOLE === 'true',
        colorize: process.env.LOG_COLORIZE !== 'false',
      },
    };

    // Docker Configuration
    this.docker = {
      socketPath: process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock',
      host: process.env.DOCKER_HOST,
      port: process.env.DOCKER_PORT ? parseInt(process.env.DOCKER_PORT) : undefined,
      ca: process.env.DOCKER_CA,
      cert: process.env.DOCKER_CERT,
      key: process.env.DOCKER_KEY,
      timeout: parseInt(process.env.DOCKER_TIMEOUT) || 30000,
    };

    // Template Configuration
    this.templates = {
      cacheEnabled: process.env.TEMPLATE_CACHE_ENABLED !== 'false',
      cacheTTL: parseInt(process.env.TEMPLATE_CACHE_TTL) || 3600, // 1 hour
      maxTemplateSize: parseInt(process.env.MAX_TEMPLATE_SIZE) || 100 * 1024, // 100KB
      defaultCategory: process.env.DEFAULT_TEMPLATE_CATEGORY || 'web-application',
    };

    // API Configuration
    this.api = {
      prefix: process.env.API_PREFIX || '/api',
      version: process.env.API_VERSION || 'v1',
      documentation: {
        enabled: process.env.API_DOCS_ENABLED !== 'false',
        path: process.env.API_DOCS_PATH || '/api/docs',
      },
      pagination: {
        defaultLimit: parseInt(process.env.API_DEFAULT_LIMIT) || 10,
        maxLimit: parseInt(process.env.API_MAX_LIMIT) || 100,
      },
    };

    // Monitoring Configuration
    this.monitoring = {
      metrics: {
        enabled: process.env.METRICS_ENABLED === 'true',
        port: parseInt(process.env.METRICS_PORT) || 9090,
        path: process.env.METRICS_PATH || '/metrics',
      },
      health: {
        path: process.env.HEALTH_PATH || '/health',
      },
    };

    // Email Configuration (for notifications)
    this.email = {
      smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      from: {
        name: process.env.EMAIL_FROM_NAME || 'Template Generator',
        address: process.env.EMAIL_FROM_ADDRESS || 'noreply@template-generator.com',
      },
    };
  }

  getCorsOrigins() {
    const origins = process.env.CORS_ORIGINS;
    if (!origins) {
      return this.environment === 'development' 
        ? ['http://localhost:3000', 'http://localhost:3001'] 
        : false;
    }
    return origins.split(',').map(origin => origin.trim());
  }

  getDefaultMongoUri() {
    const envUris = {
      development: 'mongodb://localhost:27017/template-generator-dev',
      test: 'mongodb://localhost:27017/template-generator-test',
      production: 'mongodb://localhost:27017/template-generator-prod',
    };
    return envUris[this.environment] || envUris.development;
  }

  generateFallbackSecret() {
    if (this.environment === 'production') {
      throw new Error('JWT_SECRET must be set in production environment');
    }
    console.warn('Warning: Using fallback JWT secret. Set JWT_SECRET environment variable.');
    return 'fallback-jwt-secret-for-development-only';
  }

  // Validation methods
  validate() {
    const errors = [];

    if (this.environment === 'production') {
      if (!process.env.JWT_SECRET) {
        errors.push('JWT_SECRET is required in production');
      }
      if (!process.env.MONGODB_URI) {
        errors.push('MONGODB_URI is required in production');
      }
      if (this.jwt.secret === 'fallback-jwt-secret-for-development-only') {
        errors.push('Production JWT_SECRET cannot be the fallback value');
      }
    }

    if (this.server.port < 1 || this.server.port > 65535) {
      errors.push('PORT must be between 1 and 65535');
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }
  }

  // Get configuration for specific environment
  getEnvironmentConfig() {
    return {
      development: {
        debug: true,
        verbose: true,
        mockExternalServices: true,
      },
      test: {
        debug: false,
        verbose: false,
        mockExternalServices: true,
        database: {
          mongodb: {
            uri: 'mongodb://localhost:27017/template-generator-test',
          },
        },
      },
      production: {
        debug: false,
        verbose: false,
        mockExternalServices: false,
      },
    }[this.environment] || {};
  }
}

// Create and export singleton instance
const config = new Config();

// Validate configuration on startup
try {
  config.validate();
} catch (error) {
  console.error('Configuration Error:', error.message);
  process.exit(1);
}

module.exports = config;