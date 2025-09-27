const crypto = require('crypto');

/**
 * Database utilities
 */
class DatabaseUtils {
  /**
   * Create a database connection string
   */
  static createConnectionString(config) {
    const { protocol, username, password, host, port, database, options = {} } = config;
    
    let connectionString = `${protocol}://`;
    
    if (username && password) {
      connectionString += `${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
    }
    
    connectionString += `${host}`;
    
    if (port) {
      connectionString += `:${port}`;
    }
    
    if (database) {
      connectionString += `/${database}`;
    }
    
    // Add query parameters
    const queryParams = Object.entries(options)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    if (queryParams) {
      connectionString += `?${queryParams}`;
    }
    
    return connectionString;
  }

  /**
   * Parse connection string
   */
  static parseConnectionString(connectionString) {
    const regex = /^(\w+):\/\/(?:([^:@]+)(?::([^@]+))?@)?([^:\/]+)(?::(\d+))?(?:\/([^?]+))?(?:\?(.+))?$/;
    const match = connectionString.match(regex);
    
    if (!match) {
      throw new Error('Invalid connection string format');
    }
    
    const [, protocol, username, password, host, port, database, queryString] = match;
    
    const options = {};
    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=');
        options[key] = decodeURIComponent(value);
      });
    }
    
    return {
      protocol,
      username: username ? decodeURIComponent(username) : undefined,
      password: password ? decodeURIComponent(password) : undefined,
      host,
      port: port ? parseInt(port) : undefined,
      database,
      options,
    };
  }

  /**
   * Generate MongoDB connection options
   */
  static getMongoOptions(environment = 'development') {
    const baseOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const envOptions = {
      development: {
        ...baseOptions,
        bufferCommands: false,
      },
      production: {
        ...baseOptions,
        maxPoolSize: 50,
        retryWrites: true,
        w: 'majority',
      },
      test: {
        ...baseOptions,
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 2000,
      },
    };

    return envOptions[environment] || baseOptions;
  }

  /**
   * Sanitize database query
   */
  static sanitizeQuery(query) {
    if (typeof query !== 'object' || query === null) {
      return query;
    }

    const sanitized = {};
    
    for (const [key, value] of Object.entries(query)) {
      // Remove MongoDB operators that could be dangerous
      if (key.startsWith('$') && !this.isAllowedOperator(key)) {
        continue;
      }
      
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeQuery(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  /**
   * Check if MongoDB operator is allowed
   */
  static isAllowedOperator(operator) {
    const allowedOperators = [
      '$eq', '$ne', '$gt', '$gte', '$lt', '$lte',
      '$in', '$nin', '$exists', '$regex', '$options',
      '$and', '$or', '$nor', '$not',
      '$elemMatch', '$size', '$all',
      '$sort', '$limit', '$skip', '$project',
    ];
    
    return allowedOperators.includes(operator);
  }
}

/**
 * Pagination utilities
 */
class PaginationUtils {
  /**
   * Calculate pagination metadata
   */
  static calculatePagination(page, limit, total) {
    const currentPage = Math.max(1, parseInt(page) || 1);
    const itemsPerPage = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const totalPages = Math.ceil(total / itemsPerPage);
    const skip = (currentPage - 1) * itemsPerPage;
    
    return {
      page: currentPage,
      limit: itemsPerPage,
      total,
      pages: totalPages,
      skip,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
      prevPage: currentPage > 1 ? currentPage - 1 : null,
    };
  }

  /**
   * Generate pagination links
   */
  static generateLinks(baseUrl, pagination) {
    const { page, pages, hasNext, hasPrev } = pagination;
    
    const links = {
      self: `${baseUrl}?page=${page}`,
      first: `${baseUrl}?page=1`,
      last: `${baseUrl}?page=${pages}`,
    };
    
    if (hasNext) {
      links.next = `${baseUrl}?page=${page + 1}`;
    }
    
    if (hasPrev) {
      links.prev = `${baseUrl}?page=${page - 1}`;
    }
    
    return links;
  }
}

/**
 * Validation utilities
 */
class ValidationUtils {
  /**
   * Validate MongoDB ObjectId
   */
  static isValidObjectId(id) {
    const mongoose = require('mongoose');
    return mongoose.Types.ObjectId.isValid(id);
  }

  /**
   * Validate email format
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate Docker image name
   */
  static isValidDockerImage(image) {
    // Docker image format: [registry/]namespace/name[:tag][@digest]
    const dockerImageRegex = /^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?::[0-9]+)?\/)?[a-z0-9]+(?:[._-][a-z0-9]+)*(?:\/[a-z0-9]+(?:[._-][a-z0-9]+)*)*(?::[a-zA-Z0-9][a-zA-Z0-9._-]{0,127})?(?:@sha256:[a-f0-9]{64})?$/;
    return dockerImageRegex.test(image);
  }

  /**
   * Validate port number
   */
  static isValidPort(port) {
    const portNum = parseInt(port);
    return portNum >= 1 && portNum <= 65535;
  }

  /**
   * Validate semantic version
   */
  static isValidSemVer(version) {
    const semVerRegex = /^\d+\.\d+\.\d+(?:-[\w\.-]+)?(?:\+[\w\.-]+)?$/;
    return semVerRegex.test(version);
  }

  /**
   * Sanitize input for XSS prevention
   */
  static sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }
}

/**
 * Security utilities
 */
class SecurityUtils {
  /**
   * Generate random string
   */
  static generateRandomString(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate UUID v4
   */
  static generateUUID() {
    return crypto.randomUUID();
  }

  /**
   * Hash password (for future auth implementation)
   */
  static async hashPassword(password) {
    const bcrypt = require('bcrypt');
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password (for future auth implementation)
   */
  static async verifyPassword(password, hashedPassword) {
    const bcrypt = require('bcrypt');
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate JWT token (for future auth implementation)
   */
  static generateJWTToken(payload, expiresIn = '24h') {
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Rate limit key generator
   */
  static generateRateLimitKey(req, type = 'ip') {
    switch (type) {
      case 'ip':
        return `rate_limit:${req.ip}`;
      case 'user':
        return `rate_limit:user:${req.user?.id || 'anonymous'}`;
      case 'endpoint':
        return `rate_limit:${req.method}:${req.route?.path || req.path}:${req.ip}`;
      default:
        return `rate_limit:${req.ip}`;
    }
  }
}

/**
 * Date utilities
 */
class DateUtils {
  /**
   * Format date to ISO string
   */
  static toISOString(date = new Date()) {
    return date.toISOString();
  }

  /**
   * Add time to date
   */
  static addTime(date, amount, unit) {
    const newDate = new Date(date);
    
    switch (unit) {
      case 'seconds':
        newDate.setSeconds(newDate.getSeconds() + amount);
        break;
      case 'minutes':
        newDate.setMinutes(newDate.getMinutes() + amount);
        break;
      case 'hours':
        newDate.setHours(newDate.getHours() + amount);
        break;
      case 'days':
        newDate.setDate(newDate.getDate() + amount);
        break;
      case 'weeks':
        newDate.setDate(newDate.getDate() + (amount * 7));
        break;
      case 'months':
        newDate.setMonth(newDate.getMonth() + amount);
        break;
      case 'years':
        newDate.setFullYear(newDate.getFullYear() + amount);
        break;
      default:
        throw new Error('Invalid time unit');
    }
    
    return newDate;
  }

  /**
   * Check if date is expired
   */
  static isExpired(expirationDate) {
    return new Date() > new Date(expirationDate);
  }

  /**
   * Get time ago string
   */
  static timeAgo(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffMin < 60) return `${diffMin} minutes ago`;
    if (diffHour < 24) return `${diffHour} hours ago`;
    if (diffDay < 30) return `${diffDay} days ago`;
    
    return new Date(date).toLocaleDateString();
  }
}

module.exports = {
  DatabaseUtils,
  PaginationUtils,
  ValidationUtils,
  SecurityUtils,
  DateUtils,
};