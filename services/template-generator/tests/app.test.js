const request = require('supertest');
const mongoose = require('mongoose');
const Application = require('../index');

describe('Template Generator Service', () => {
  let app;
  let server;

  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_URI = 'mongodb://localhost:27017/template-generator-test';
    
    // Create application instance
    const appInstance = new Application();
    app = appInstance.app;
    
    // Connect to test database
    await appInstance.connectDatabase();
  });

  afterAll(async () => {
    // Clean up database
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('Health Endpoints', () => {
    it('should return service info on root endpoint', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('service', 'Template Generator Service');
      expect(response.body).toHaveProperty('status', 'running');
      expect(response.body).toHaveProperty('endpoints');
    });

    it('should return health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Template Generator Service is running');
    });

    it('should return detailed health status', async () => {
      const response = await request(app)
        .get('/health/status')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('service', 'template-generator');
      expect(response.body.data).toHaveProperty('status', 'healthy');
      expect(response.body.data).toHaveProperty('dependencies');
      expect(response.body.data.dependencies).toHaveProperty('mongodb');
    });

    it('should return readiness status', async () => {
      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Service is ready');
    });

    it('should return liveness status', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Service is alive');
    });
  });

  describe('API Endpoints', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(response.body).toHaveProperty('service', 'Template Generator Service');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('templates', '/api/templates');
    });

    it('should handle 404 for non-existent API endpoints', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'API endpoint not found');
    });
  });

  describe('Template Endpoints', () => {
    it('should get all templates', async () => {
      const response = await request(app)
        .get('/api/templates')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('templates');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should handle invalid template ID', async () => {
      const response = await request(app)
        .get('/api/templates/invalid-id')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should handle non-existent template', async () => {
      const validObjectId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/templates/${validObjectId}`)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Route not found');
    });

    it('should handle CORS preflight requests', async () => {
      await request(app)
        .options('/api/templates')
        .expect(204);
    });
  });
});