const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// Initialize AJV with additional formats
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// Template creation schema
const templateCreateSchema = {
  type: 'object',
  required: ['name', 'description', 'category', 'templateContent', 'metadata'],
  properties: {
    name: {
      type: 'string',
      minLength: 3,
      maxLength: 100,
      pattern: '^[a-zA-Z0-9-_\\s]+$',
    },
    description: {
      type: 'string',
      minLength: 10,
      maxLength: 500,
    },
    category: {
      type: 'string',
      enum: [
        'web-application',
        'database',
        'messaging',
        'monitoring',
        'ci-cd',
        'development',
        'production',
        'microservices',
        'data-processing',
        'security',
      ],
    },
    version: {
      type: 'string',
      pattern: '^\\d+\\.\\d+\\.\\d+$',
      default: '1.0.0',
    },
    tags: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 2,
        maxLength: 30,
      },
      maxItems: 10,
    },
    templateContent: {
      type: 'string',
      minLength: 50,
    },
    variables: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'type', 'description'],
        properties: {
          name: {
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9_]*$',
            minLength: 1,
            maxLength: 50,
          },
          type: {
            type: 'string',
            enum: ['string', 'number', 'boolean', 'array', 'object'],
          },
          description: {
            type: 'string',
            minLength: 5,
            maxLength: 200,
          },
          defaultValue: true, // Allow any type
          required: {
            type: 'boolean',
            default: false,
          },
          validation: {
            type: 'object',
            properties: {
              pattern: { type: 'string' },
              minLength: { type: 'integer', minimum: 0 },
              maxLength: { type: 'integer', minimum: 1 },
              minimum: { type: 'number' },
              maximum: { type: 'number' },
              enum: {
                type: 'array',
                items: { type: 'string' },
                minItems: 1,
              },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
    },
    services: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'image'],
        properties: {
          name: {
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9_-]*$',
          },
          image: {
            type: 'string',
            minLength: 3,
          },
          description: {
            type: 'string',
            maxLength: 200,
          },
          ports: {
            type: 'array',
            items: {
              type: 'string',
              pattern: '^\\d+(:|-\\d+)?$',
            },
          },
          volumes: {
            type: 'array',
            items: { type: 'string' },
          },
          environment: {
            type: 'array',
            items: {
              type: 'object',
              required: ['key', 'value'],
              properties: {
                key: { type: 'string' },
                value: { type: 'string' },
              },
              additionalProperties: false,
            },
          },
        },
        additionalProperties: false,
      },
    },
    networks: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9_-]*$',
          },
          driver: {
            type: 'string',
            enum: ['bridge', 'host', 'overlay', 'macvlan', 'none'],
            default: 'bridge',
          },
          external: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    },
    volumes: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            pattern: '^[a-zA-Z][a-zA-Z0-9_-]*$',
          },
          driver: {
            type: 'string',
            default: 'local',
          },
          external: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    },
    metadata: {
      type: 'object',
      required: ['author'],
      properties: {
        author: {
          type: 'string',
          minLength: 2,
          maxLength: 100,
        },
        authorEmail: {
          type: 'string',
          format: 'email',
        },
        license: {
          type: 'string',
          enum: ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC', 'Custom'],
          default: 'MIT',
        },
        homepage: {
          type: 'string',
          format: 'uri',
        },
        repository: {
          type: 'string',
          format: 'uri',
        },
        documentation: {
          type: 'string',
          format: 'uri',
        },
      },
      additionalProperties: false,
    },
    isPublic: {
      type: 'boolean',
      default: true,
    },
  },
  additionalProperties: false,
};

// Template update schema (all fields optional except those that shouldn't be changed)
const templateUpdateSchema = {
  type: 'object',
  properties: {
    name: templateCreateSchema.properties.name,
    description: templateCreateSchema.properties.description,
    category: templateCreateSchema.properties.category,
    version: templateCreateSchema.properties.version,
    tags: templateCreateSchema.properties.tags,
    templateContent: templateCreateSchema.properties.templateContent,
    variables: templateCreateSchema.properties.variables,
    services: templateCreateSchema.properties.services,
    networks: templateCreateSchema.properties.networks,
    volumes: templateCreateSchema.properties.volumes,
    metadata: templateCreateSchema.properties.metadata,
    isPublic: templateCreateSchema.properties.isPublic,
  },
  additionalProperties: false,
  minProperties: 1,
};

// Template generation schema
const templateGenerationSchema = {
  type: 'object',
  properties: {
    variables: {
      type: 'object',
      additionalProperties: true, // Variable names are dynamic
    },
  },
  additionalProperties: false,
};

// User schema
const userCreateSchema = {
  type: 'object',
  required: ['username', 'email', 'firstName', 'lastName'],
  properties: {
    username: {
      type: 'string',
      minLength: 3,
      maxLength: 30,
      pattern: '^[a-zA-Z0-9_-]+$',
    },
    email: {
      type: 'string',
      format: 'email',
    },
    firstName: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
    lastName: {
      type: 'string',
      minLength: 1,
      maxLength: 50,
    },
    profile: {
      type: 'object',
      properties: {
        bio: {
          type: 'string',
          maxLength: 500,
        },
        organization: {
          type: 'string',
          maxLength: 100,
        },
        website: {
          type: 'string',
          format: 'uri',
        },
        location: {
          type: 'string',
          maxLength: 100,
        },
      },
      additionalProperties: false,
    },
    preferences: {
      type: 'object',
      properties: {
        emailNotifications: {
          type: 'boolean',
          default: true,
        },
        publicProfile: {
          type: 'boolean',
          default: true,
        },
        theme: {
          type: 'string',
          enum: ['light', 'dark', 'auto'],
          default: 'light',
        },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};

// Compile schemas
const validateTemplateCreate = ajv.compile(templateCreateSchema);
const validateTemplateUpdate = ajv.compile(templateUpdateSchema);
const validateTemplateGeneration = ajv.compile(templateGenerationSchema);
const validateUserCreate = ajv.compile(userCreateSchema);

// Export validators and schemas
module.exports = {
  // Validators
  validateTemplateCreate,
  validateTemplateUpdate,
  validateTemplateGeneration,
  validateUserCreate,
  
  // Raw schemas for documentation
  schemas: {
    templateCreate: templateCreateSchema,
    templateUpdate: templateUpdateSchema,
    templateGeneration: templateGenerationSchema,
    userCreate: userCreateSchema,
  },
  
  // AJV instance for custom validations
  ajv,
};