/**
 * Jest Test Setup
 * Global test configuration and setup
 */

// Set test environment
process.env.NODE_ENV = 'test';

// Mock environment variables
process.env.MONGODB_URI = 'mongodb://localhost:27017/template-generator-test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.LOG_LEVEL = 'silent';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods in tests
global.console = {
  ...console,
  // Suppress console.log in tests unless needed
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test helpers
global.createTestUser = () => ({
  _id: '507f1f77bcf86cd799439011',
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  isActive: true,
  isVerified: true,
});

global.createTestTemplate = () => ({
  _id: '507f1f77bcf86cd799439012',
  name: 'Test Template',
  description: 'A test template for unit testing',
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
  metadata: {
    author: 'Test Author',
    authorEmail: 'author@test.com',
  },
  isPublic: true,
  isActive: true,
  createdBy: '507f1f77bcf86cd799439011',
  usage: {
    downloadCount: 0,
    rating: { average: 0, count: 0 },
  },
});

// Mock external services
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    colorize: jest.fn(),
    simple: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn(),
  },
}));

// Mock file system operations
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

// Suppress deprecation warnings
process.env.NODE_NO_WARNINGS = '1';

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection in test:', reason);
});

// Clean up after tests
afterAll(() => {
  // Close any open handles
  jest.clearAllTimers();
});