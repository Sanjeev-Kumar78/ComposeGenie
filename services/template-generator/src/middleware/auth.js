/**
 * Authentication Middleware
 * Handles authentication and authorization for protected routes
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthMiddleware {
  /**
   * Require authentication for protected routes
   */
  requireAuth = async (req, res, next) => {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access token is required',
        });
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      
      // Get user from database
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
        });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
        });
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired',
        });
      }

      next(error);
    }
  };

  /**
   * Optional authentication - doesn't fail if no token provided
   */
  optionalAuth = async (req, res, next) => {
    try {
      const token = this.extractToken(req);
      
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      }
      
      next();
    } catch (error) {
      // Ignore authentication errors for optional auth
      next();
    }
  };

  /**
   * Require admin role
   */
  requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }
    next();
  };

  /**
   * Require moderator or admin role
   */
  requireModerator = (req, res, next) => {
    if (!req.user || !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Moderator or admin access required',
      });
    }
    next();
  };

  /**
   * Require resource ownership (user owns the resource)
   */
  requireOwnership = async (req, res, next) => {
    try {
      const { Template } = require('../models');
      const resourceId = req.params.id;
      
      const resource = await Template.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
      }

      if (resource.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only modify your own resources',
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Require ownership or admin privileges
   */
  requireOwnershipOrAdmin = async (req, res, next) => {
    try {
      if (req.user.role === 'admin') {
        return next();
      }

      const { Template } = require('../models');
      const resourceId = req.params.id;
      
      const resource = await Template.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
      }

      if (resource.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only modify your own resources or need admin privileges',
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Extract token from Authorization header or query parameter
   */
  extractToken = (req) => {
    let token = null;

    // Check Authorization header
    if (req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    // Check query parameter as fallback
    if (!token && req.query.token) {
      token = req.query.token;
    }

    return token;
  };
}

module.exports = new AuthMiddleware();