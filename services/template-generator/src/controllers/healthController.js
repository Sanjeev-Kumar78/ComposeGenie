/**
 * Health Controller 
 */
class HealthController {
  healthCheck(req, res) {
    res.json({
      success: true,
      message: 'Template Generator Service is running',
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new HealthController();