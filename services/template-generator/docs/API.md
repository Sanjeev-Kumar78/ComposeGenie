# Template Generator Service API Documentation

## Overview

The Template Generator Service is a microservice responsible for managing, generating, and validating Docker Compose templates for various application stacks and use cases.

## Base URL

```
http://localhost:3000
```

## Authentication

Currently, the service supports JWT-based authentication for protected endpoints. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Health Check Endpoints

#### GET /health

Basic health check endpoint.

**Response:**
```json
{
  "success": true,
  "message": "Template Generator Service is running",
  "timestamp": "2023-09-27T10:00:00.000Z",
  "service": "template-generator",
  "version": "1.0.0"
}
```

#### GET /health/status

Detailed health status with dependencies.

**Response:**
```json
{
  "success": true,
  "data": {
    "service": "template-generator",
    "status": "healthy",
    "timestamp": "2023-09-27T10:00:00.000Z",
    "version": "1.0.0",
    "uptime": 123.45,
    "dependencies": {
      "mongodb": {
        "status": "connected",
        "readyState": 1
      }
    },
    "system": {
      "memory": {
        "used": 50000000,
        "total": 100000000,
        "external": 5000000
      },
      "cpu": {
        "user": 1000,
        "system": 500
      },
      "platform": "linux",
      "nodeVersion": "v18.17.0"
    }
  }
}
```

### Template Endpoints

#### GET /api/templates

Get all public templates with pagination and filtering.

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 10, max: 100)
- `category` (string, optional): Filter by category
- `search` (string, optional): Search in name, description, and tags

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "_id": "64f1234567890abcdef12345",
        "name": "Node.js + MongoDB Stack",
        "description": "Complete MEAN/MERN stack template",
        "category": "web-application",
        "version": "1.2.0",
        "tags": ["nodejs", "mongodb", "web"],
        "metadata": {
          "author": "John Doe",
          "authorEmail": "john@example.com"
        },
        "usage": {
          "downloadCount": 150,
          "rating": {
            "average": 4.5,
            "count": 10
          }
        },
        "createdAt": "2023-09-01T10:00:00.000Z",
        "updatedAt": "2023-09-15T14:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### GET /api/templates/:id

Get a specific template by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1234567890abcdef12345",
    "name": "Node.js + MongoDB Stack",
    "description": "Complete MEAN/MERN stack template with Redis caching",
    "category": "web-application",
    "version": "1.2.0",
    "tags": ["nodejs", "mongodb", "redis", "web"],
    "templateContent": "version: '3.8'\nservices:\n  app:\n    image: {{app_image}}:{{app_tag}}\n    ...",
    "variables": [
      {
        "name": "app_image",
        "type": "string",
        "description": "Application Docker image",
        "defaultValue": "node",
        "required": true,
        "validation": {
          "pattern": "^[a-z0-9-_/.]+$"
        }
      }
    ],
    "services": [
      {
        "name": "app",
        "image": "node:18-alpine",
        "description": "Main application service",
        "ports": ["3000:3000"],
        "volumes": ["./app:/usr/src/app"]
      }
    ],
    "networks": [
      {
        "name": "app-network",
        "driver": "bridge"
      }
    ],
    "volumes": [
      {
        "name": "mongodb_data",
        "driver": "local"
      }
    ],
    "metadata": {
      "author": "John Doe",
      "authorEmail": "john@example.com",
      "license": "MIT",
      "documentation": "https://github.com/example/template"
    },
    "usage": {
      "downloadCount": 150,
      "rating": {
        "average": 4.5,
        "count": 10
      }
    },
    "createdBy": {
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe"
    },
    "createdAt": "2023-09-01T10:00:00.000Z",
    "updatedAt": "2023-09-15T14:30:00.000Z"
  }
}
```

#### POST /api/templates

Create a new template. **Requires authentication.**

**Request Body:**
```json
{
  "name": "My Custom Template",
  "description": "A custom template for my application stack",
  "category": "web-application",
  "templateContent": "version: '3.8'\nservices:\n  app:\n    image: {{app_image}}:{{app_tag}}\n    ports:\n      - \"{{app_port}}:3000\"",
  "variables": [
    {
      "name": "app_image",
      "type": "string",
      "description": "Application Docker image",
      "defaultValue": "node",
      "required": true
    },
    {
      "name": "app_tag",
      "type": "string",
      "description": "Docker image tag",
      "defaultValue": "18-alpine",
      "required": false
    },
    {
      "name": "app_port",
      "type": "number",
      "description": "Application port",
      "defaultValue": 3000,
      "required": true,
      "validation": {
        "minimum": 1024,
        "maximum": 65535
      }
    }
  ],
  "metadata": {
    "author": "Jane Smith",
    "authorEmail": "jane@example.com",
    "license": "MIT"
  },
  "tags": ["nodejs", "custom"],
  "isPublic": true
}
```

#### POST /api/templates/:id/generate

Generate Docker Compose file from template.

**Request Body:**
```json
{
  "variables": {
    "app_image": "node",
    "app_tag": "18-alpine",
    "app_port": 3000,
    "app_name": "myapp",
    "database_name": "myapp_db"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dockerCompose": "version: '3.8'\n\nservices:\n  myapp:\n    image: node:18-alpine\n    ports:\n      - \"3000:3000\"\n    environment:\n      - NODE_ENV=production\n      - DATABASE_URL=mongodb://mongodb:27017/myapp_db\n    depends_on:\n      - mongodb\n\n  mongodb:\n    image: mongo:5.0\n    ports:\n      - \"27017:27017\"\n    volumes:\n      - mongodb_data:/data/db\n\nvolumes:\n  mongodb_data:\n    driver: local"
  }
}
```

#### POST /api/templates/:id/validate

Validate template configuration and variables.

**Request Body:**
```json
{
  "variables": {
    "app_image": "node",
    "app_port": 3000
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": [],
    "warnings": []
  }
}
```

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Template name is required",
      "value": "",
      "location": "body"
    }
  ]
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Template not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal Server Error",
  "correlationId": "abc123-def456"
}
```

## Template Categories

- `web-application`: Web applications and full-stack templates
- `database`: Database-specific templates
- `messaging`: Message queue and streaming templates
- `monitoring`: Monitoring and observability stacks
- `ci-cd`: CI/CD pipeline templates
- `development`: Development environment templates
- `production`: Production-ready templates
- `microservices`: Microservice architecture templates
- `data-processing`: Data processing and analytics templates
- `security`: Security and authentication templates

## Variable Types

- `string`: Text values
- `number`: Numeric values
- `boolean`: True/false values
- `array`: List of values
- `object`: Complex object structures

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- 100 requests per 15-minute window per IP address
- Higher limits available for authenticated users

## CORS

Cross-Origin Resource Sharing (CORS) is enabled for specified origins. Contact administrators for allowlist additions.