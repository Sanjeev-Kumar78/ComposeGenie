const mongoose = require('mongoose');
const { Template, User } = require('../src/models');

describe('Template Model', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect('mongodb://localhost:27017/template-generator-test');
  });

  beforeEach(async () => {
    // Clear the database before each test
    await Template.deleteMany({});
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('Template Creation', () => {
    let testUser;

    beforeEach(async () => {
      // Create a test user
      testUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      });
      await testUser.save();
    });

    it('should create a valid template', async () => {
      const templateData = {
        name: 'Test Template',
        description: 'A test template for unit testing',
        category: 'web-application',
        templateContent: 'version: "3.8"\nservices:\n  app:\n    image: nginx:latest',
        variables: [
          {
            name: 'app_name',
            type: 'string',
            description: 'Application name',
            defaultValue: 'myapp',
            required: true,
          },
        ],
        metadata: {
          author: 'Test Author',
          authorEmail: 'author@example.com',
        },
        createdBy: testUser._id,
      };

      const template = new Template(templateData);
      const savedTemplate = await template.save();

      expect(savedTemplate).toBeDefined();
      expect(savedTemplate.name).toBe('Test Template');
      expect(savedTemplate.category).toBe('web-application');
      expect(savedTemplate.isPublic).toBe(true); // default value
      expect(savedTemplate.isActive).toBe(true); // default value
    });

    it('should fail validation with missing required fields', async () => {
      const invalidTemplate = new Template({
        name: 'Invalid Template',
        // Missing required fields
      });

      await expect(invalidTemplate.save()).rejects.toThrow();
    });

    it('should validate category enum', async () => {
      const invalidTemplate = new Template({
        name: 'Test Template',
        description: 'A test template',
        category: 'invalid-category', // Invalid category
        templateContent: 'test content',
        metadata: { author: 'Test Author' },
        createdBy: testUser._id,
      });

      await expect(invalidTemplate.save()).rejects.toThrow();
    });

    it('should validate email format in metadata', async () => {
      const invalidTemplate = new Template({
        name: 'Test Template',
        description: 'A test template',
        category: 'web-application',
        templateContent: 'test content',
        metadata: {
          author: 'Test Author',
          authorEmail: 'invalid-email', // Invalid email
        },
        createdBy: testUser._id,
      });

      await expect(invalidTemplate.save()).rejects.toThrow();
    });
  });

  describe('Template Methods', () => {
    let template;
    let testUser;

    beforeEach(async () => {
      // Create a test user
      testUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      });
      await testUser.save();

      // Create a test template
      template = new Template({
        name: 'Test Template',
        description: 'A test template for unit testing',
        category: 'web-application',
        templateContent: 'version: "3.8"',
        metadata: { author: 'Test Author' },
        createdBy: testUser._id,
      });
      await template.save();
    });

    it('should increment download count', async () => {
      const initialCount = template.usage.downloadCount;
      await template.incrementDownloadCount();
      
      const updatedTemplate = await Template.findById(template._id);
      expect(updatedTemplate.usage.downloadCount).toBe(initialCount + 1);
      expect(updatedTemplate.usage.lastUsed).toBeDefined();
    });

    it('should add rating correctly', async () => {
      await template.addRating(4);
      await template.addRating(5);
      
      const updatedTemplate = await Template.findById(template._id);
      expect(updatedTemplate.usage.rating.count).toBe(2);
      expect(updatedTemplate.usage.rating.average).toBe(4.5);
    });
  });

  describe('Template Static Methods', () => {
    let testUser;
    let templates;

    beforeEach(async () => {
      // Create a test user
      testUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      });
      await testUser.save();

      // Create test templates
      templates = await Template.insertMany([
        {
          name: 'Web App Template',
          description: 'A web application template',
          category: 'web-application',
          templateContent: 'version: "3.8"',
          metadata: { author: 'Author 1' },
          createdBy: testUser._id,
          usage: { downloadCount: 100, rating: { average: 4.5, count: 10 } },
        },
        {
          name: 'Database Template',
          description: 'A database template',
          category: 'database',
          templateContent: 'version: "3.8"',
          metadata: { author: 'Author 2' },
          createdBy: testUser._id,
          usage: { downloadCount: 50, rating: { average: 3.8, count: 5 } },
        },
      ]);
    });

    it('should find templates by category', async () => {
      const webAppTemplates = await Template.findByCategory('web-application');
      expect(webAppTemplates).toHaveLength(1);
      expect(webAppTemplates[0].name).toBe('Web App Template');
    });

    it('should find popular templates', async () => {
      const popularTemplates = await Template.findPopular(5);
      expect(popularTemplates).toHaveLength(2);
      // Should be sorted by download count desc
      expect(popularTemplates[0].usage.downloadCount).toBe(100);
    });

    it('should search templates', async () => {
      const searchResults = await Template.search('web');
      expect(searchResults.length).toBeGreaterThan(0);
      expect(searchResults[0].name).toContain('Web');
    });
  });

  describe('Template Virtuals', () => {
    let template;
    let testUser;

    beforeEach(async () => {
      testUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      });
      await testUser.save();

      template = new Template({
        name: 'Test Template',
        description: 'A test template',
        category: 'web-application',
        version: '2.1.0',
        templateContent: 'version: "3.8"',
        metadata: { author: 'Test Author' },
        createdBy: testUser._id,
      });
      await template.save();
    });

    it('should generate fullName virtual', () => {
      expect(template.fullName).toBe('Test Template v2.1.0');
    });
  });
});