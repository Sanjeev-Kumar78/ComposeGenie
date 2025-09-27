const templateService = require('../src/services/templateService');
const { Template, User } = require('../src/models');
const mongoose = require('mongoose');

// Mock the models
jest.mock('../src/models');

describe('Template Service', () => {
  let mockUser;
  let mockTemplate;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    mockUser = {
      _id: new mongoose.Types.ObjectId(),
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };

    mockTemplate = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Template',
      description: 'A test template',
      category: 'web-application',
      templateContent: 'version: "3.8"\nservices:\n  app:\n    image: {{image}}:{{tag}}',
      variables: [
        {
          name: 'image',
          type: 'string',
          description: 'Docker image name',
          required: true,
        },
        {
          name: 'tag',
          type: 'string',
          description: 'Docker image tag',
          defaultValue: 'latest',
          required: false,
        },
      ],
      isPublic: true,
      isActive: true,
      createdBy: mockUser._id,
      usage: {
        downloadCount: 0,
        rating: { average: 0, count: 0 },
      },
      save: jest.fn().mockResolvedValue(mockTemplate),
      incrementDownloadCount: jest.fn().mockResolvedValue(mockTemplate),
    };
  });

  describe('getAllTemplates', () => {
    it('should get all templates with pagination', async () => {
      const mockTemplates = [mockTemplate];
      const mockPagination = {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
        hasNext: false,
        hasPrev: false,
      };

      Template.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  lean: jest.fn().mockResolvedValue(mockTemplates),
                }),
              }),
            }),
          }),
        }),
      });

      Template.countDocuments = jest.fn().mockResolvedValue(1);

      const result = await templateService.getAllTemplates({ page: 1, limit: 10 });

      expect(result.templates).toEqual(mockTemplates);
      expect(result.pagination.total).toBe(1);
      expect(Template.find).toHaveBeenCalledWith({ isPublic: true, isActive: true });
    });

    it('should apply search filter', async () => {
      Template.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  lean: jest.fn().mockResolvedValue([]),
                }),
              }),
            }),
          }),
        }),
      });

      Template.countDocuments = jest.fn().mockResolvedValue(0);

      await templateService.getAllTemplates({ search: 'test' });

      expect(Template.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $and: [
            { isPublic: true, isActive: true },
            {
              $or: expect.arrayContaining([
                { name: { $regex: 'test', $options: 'i' } },
                { description: { $regex: 'test', $options: 'i' } },
              ]),
            },
          ],
        })
      );
    });
  });

  describe('getTemplateById', () => {
    it('should get template by ID', async () => {
      Template.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockTemplate),
        }),
      });

      Template.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTemplate),
      });

      const result = await templateService.getTemplateById(mockTemplate._id);

      expect(result).toEqual(mockTemplate);
      expect(Template.findById).toHaveBeenCalledWith(mockTemplate._id);
    });

    it('should return null for non-existent template', async () => {
      Template.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      });

      const result = await templateService.getTemplateById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('generateDockerCompose', () => {
    it('should generate Docker Compose from template', async () => {
      Template.findById = jest.fn().mockResolvedValue(mockTemplate);

      const variables = {
        image: 'nginx',
        tag: '1.21',
      };

      const result = await templateService.generateDockerCompose(mockTemplate._id, variables);

      expect(result).toContain('nginx:1.21');
      expect(mockTemplate.incrementDownloadCount).toHaveBeenCalled();
    });

    it('should throw error for missing required variables', async () => {
      Template.findById = jest.fn().mockResolvedValue(mockTemplate);

      const variables = {
        // Missing required 'image' variable
        tag: '1.21',
      };

      await expect(
        templateService.generateDockerCompose(mockTemplate._id, variables)
      ).rejects.toThrow('Variable validation failed');
    });

    it('should throw error for non-existent template', async () => {
      Template.findById = jest.fn().mockResolvedValue(null);

      await expect(
        templateService.generateDockerCompose('nonexistent', {})
      ).rejects.toThrow('Template not found or not accessible');
    });
  });

  describe('validateTemplate', () => {
    it('should validate template with correct variables', async () => {
      Template.findById = jest.fn().mockResolvedValue(mockTemplate);

      const variables = {
        image: 'nginx',
        tag: '1.21',
      };

      const result = await templateService.validateTemplate(mockTemplate._id, variables);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return validation errors for missing required variables', async () => {
      Template.findById = jest.fn().mockResolvedValue(mockTemplate);

      const variables = {
        tag: '1.21',
        // Missing required 'image' variable
      };

      const result = await templateService.validateTemplate(mockTemplate._id, variables);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('missing_variables');
    });
  });

  describe('createTemplate', () => {
    it('should create a new template', async () => {
      const templateData = {
        name: 'New Template',
        description: 'A new test template',
        category: 'web-application',
        templateContent: 'version: "3.8"',
        metadata: { author: 'Test Author' },
        createdBy: mockUser._id,
      };

      // Mock Template constructor and save method
      Template.mockImplementation(() => ({
        ...templateData,
        _id: new mongoose.Types.ObjectId(),
        save: jest.fn().mockResolvedValue({ ...templateData, _id: new mongoose.Types.ObjectId() }),
      }));

      User.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await templateService.createTemplate(templateData);

      expect(result).toBeDefined();
      expect(result.name).toBe('New Template');
    });
  });

  describe('validateTemplateContent', () => {
    it('should validate correct Handlebars template', async () => {
      const validTemplate = 'version: "3.8"\nservices:\n  {{service_name}}:\n    image: {{image}}';
      
      await expect(templateService.validateTemplateContent(validTemplate)).resolves.toBe(true);
    });

    it('should throw error for invalid Handlebars syntax', async () => {
      const invalidTemplate = 'version: "3.8"\nservices:\n  {{unclosed_handlebars';
      
      await expect(templateService.validateTemplateContent(invalidTemplate)).rejects.toThrow('Invalid template syntax');
    });
  });
});