# Docker Compose Generator - Backend API

## Overview
The backend API provides RESTful endpoints for docker-compose generation, template management, security scanning, and configuration validation.

## Features
- **Compose Generation**: Convert visual configurations to docker-compose.yml
- **Template Management**: CRUD operations for service templates
- **Security Integration**: Vulnerability scanning API integration
- **Configuration Validation**: Automated misconfiguration detection
- **Export Services**: Multiple format exports (Docker Swarm, Kubernetes)

## Technology Stack
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Document database for templates and configurations
- **JWT**: Authentication and authorization
- **Winston**: Structured logging
- **Joi**: Request validation

## Project Structure
```
backend/
├── src/
│   ├── routes/           # API route definitions
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── models/           # Database models
│   ├── middleware/       # Custom middleware
│   └── utils/            # Utility functions
├── tests/                # Test files
└── package.json         # Dependencies and scripts
```

## API Endpoints

### Compose Generation
- `POST /api/compose/generate` - Generate docker-compose.yml from configuration
- `POST /api/compose/validate` - Validate docker-compose configuration
- `POST /api/compose/export` - Export to different formats

### Templates
- `GET /api/templates` - List available templates
- `GET /api/templates/:id` - Get specific template
- `POST /api/templates` - Create new template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### Security
- `POST /api/security/scan` - Scan services for vulnerabilities
- `GET /api/security/reports/:id` - Get scan report
- `POST /api/security/validate-config` - Validate configuration security

### Services
- `GET /api/services/catalog` - Get service catalog
- `GET /api/services/:name/versions` - Get available versions
- `GET /api/services/:name/config` - Get service configuration schema

## Getting Started

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- Environment variables configured

### Installation
```bash
cd backend
npm install
```

### Environment Setup
Create `.env` file:
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/compose_generator
JWT_SECRET=your_jwt_secret_here
SECURITY_API_KEY=your_security_api_key
LOG_LEVEL=info
```

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Testing
```bash
npm test
```

## Security Features

### Vulnerability Scanning
- Integration with CVE databases
- Docker image vulnerability assessment
- Security recommendations
- Compliance checking

### Configuration Security
- Hardening recommendations
- Secrets management validation
- Network security analysis
- Resource limit validation

## Performance Considerations
- Request rate limiting
- Caching for templates and scan results
- Async processing for long-running scans
- Database indexing for efficient queries