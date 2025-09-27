/**
 * Health Controller
 * Handles health check and system status endpoints
 */
class HealthController {
  /**
   * Basic health check
   */
  healthCheck(req, res) {
    res.json({
      success: true,
      message: 'Template Generator Service is running',
      timestamp: new Date().toISOString(),
      service: 'template-generator',
      version: process.env.npm_package_version || '1.0.0',
    });
  }

  /**
   * Detailed health status with dependencies
   */
  async healthStatus(req, res, next) {
    try {
      const mongoose = require('mongoose');
      
      const health = {
        service: 'template-generator',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
        dependencies: {
          mongodb: {
            status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            readyState: mongoose.connection.readyState,
          },
        },
        system: {
          memory: {
            used: process.memoryUsage().heapUsed,
            total: process.memoryUsage().heapTotal,
            external: process.memoryUsage().external,
          },
          cpu: process.cpuUsage(),
          platform: process.platform,
          nodeVersion: process.version,
        },
      };

      // Check if any dependencies are unhealthy
      if (health.dependencies.mongodb.status !== 'connected') {
        health.status = 'unhealthy';
        return res.status(503).json({
          success: false,
          data: health,
          message: 'Service is unhealthy',
        });
      }

      res.json({
        success: true,
        data: health,
        message: 'Service is healthy',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Readiness probe for Kubernetes
   */
  async readiness(req, res, next) {
    try {
      const mongoose = require('mongoose');
      
      // Check if the service is ready to accept requests
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          success: false,
          message: 'Service not ready - MongoDB not connected',
        });
      }

      res.json({
        success: true,
        message: 'Service is ready',
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        message: 'Service not ready',
        error: error.message,
      });
    }
  }

  /**
   * Liveness probe for Kubernetes
   */
  liveness(req, res) {
    // Simple liveness check - if this endpoint responds, the service is alive
    res.json({
      success: true,
      message: 'Service is alive',
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new HealthController();