# Docker Compose Generator - Backend API

## Overview

The backend API serves as the central hub for docker-compose generation, Docker Hub service catalog integration, security scanning coordination, and configuration validation. It orchestrates communication between the frontend and specialized microservices.

## Core Responsibilities

### 🐳 Docker Hub Integration

- Fetch service catalog from Docker Hub
- Search and filter Docker images
- Retrieve image metadata (versions, tags, pulls, stars)
- Access image documentation and descriptions

### 🔒 Security Orchestration

- Coordinate vulnerability scanning requests
- Aggregate scan results from security-scanner service
- Determine download eligibility based on severity
- Suggest alternative image versions for vulnerable images

### ⚙️ Configuration Management

- Validate docker-compose configurations
- Detect port conflicts across services
- Identify missing environment variables
- Check resource constraints and limits
- Validate volume mounts and network settings

### 📦 Compose Generation

- Build docker-compose.yml from user selections
- Apply best practices and optimizations
- Generate environment-specific configs
- Export to multiple formats (Compose, Swarm, Kubernetes)

## Features

- **Docker Hub Catalog**: Real-time service browsing and search
- **Security Validation**: Pre-download vulnerability assessment
- **Misconfiguration Detection**: Automated issue identification
- **Alternative Suggestions**: Smart image version recommendations
- **Template Management**: CRUD operations for service templates
- **Export Services**: Multiple format exports with validation

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
│   ├── routes/              # API route definitions
│   │   ├── catalog.js       # Docker Hub catalog endpoints
│   │   ├── compose.js       # Compose generation endpoints
│   │   ├── security.js      # Security scanning endpoints
│   │   ├── validation.js    # Configuration validation endpoints
│   │   └── templates.js     # Template management endpoints
│   ├── controllers/         # Request handlers
│   │   ├── catalogController.js
│   │   ├── composeController.js
│   │   ├── securityController.js
│   │   └── validationController.js
│   ├── services/            # Business logic
│   │   ├── dockerhubService.js      # Docker Hub API integration
│   │   ├── composeService.js        # Compose file generation
│   │   ├── securityService.js       # Security scan coordination
│   │   └── validationService.js     # Configuration validation
│   ├── models/              # Database models
│   │   ├── Template.js      # Template schema
│   │   ├── ScanCache.js     # Cached scan results
│   │   └── RequestLog.js    # API request logging
│   ├── middleware/          # Custom middleware
│   │   ├── rateLimiter.js   # Rate limiting middleware
│   │   ├── validation.js    # Request validation
│   │   ├── cors.js          # CORS configuration
│   │   └── errorHandler.js  # Error handling
│   └── utils/               # Utility functions
│       ├── dockerhub.js     # Docker Hub API helpers
│       ├── yamlGenerator.js # YAML generation utilities
│       └── logger.js        # Winston logger config
├── tests/                   # Test files
└── package.json            # Dependencies and scripts
```

## API Endpoints

### Docker Hub Catalog

- `GET /api/catalog/search` - Search Docker Hub for images
  - Query params: `q` (search term), `page`, `limit`, `official` (boolean)
- `GET /api/catalog/image/:name` - Get image details from Docker Hub
- `GET /api/catalog/image/:name/tags` - Get available tags/versions
- `GET /api/catalog/image/:name/versions` - Get version history
- `GET /api/catalog/categories` - Get image categories

### Compose Generation

- `POST /api/compose/generate` - Generate docker-compose.yml from configuration
  - Body: `{ services: [...], networks: [...], volumes: [...] }`
- `POST /api/compose/validate` - Validate docker-compose configuration
- `POST /api/compose/export` - Export to different formats
  - Query params: `format` (compose, swarm, kubernetes)
- `GET /api/compose/preview` - Preview generated compose file

### Security Scanning

- `POST /api/security/scan` - Initiate vulnerability scan for services
  - Body: `{ services: [{ image, tag }] }`
- `GET /api/security/scan/:scanId` - Get scan results
- `POST /api/security/check-eligibility` - Check if compose can be downloaded
  - Returns: `{ eligible: boolean, blockers: [...], warnings: [...] }`
- `GET /api/security/alternatives/:image/:tag` - Get safer alternative versions
- `GET /api/security/report/:scanId` - Get formatted security report

### Configuration Validation

- `POST /api/validation/check` - Validate complete configuration
  - Checks: port conflicts, missing env vars, resource limits
- `POST /api/validation/ports` - Check for port conflicts
- `POST /api/validation/environment` - Validate environment variables
- `POST /api/validation/resources` - Check resource configurations
- `POST /api/validation/volumes` - Validate volume mounts
- `GET /api/validation/report/:validationId` - Get validation report

### Templates

- `GET /api/templates` - List available templates
- `GET /api/templates/:id` - Get specific template
- `POST /api/templates` - Create new template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template
- `GET /api/templates/categories` - Get template categories

## Getting Started

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

# Database
MONGODB_URI=mongodb://localhost:27017/compose_generator

# Microservices
SECURITY_SCANNER_URL=http://localhost:8001
CONFIG_VALIDATOR_URL=http://localhost:8003
TEMPLATE_GENERATOR_URL=http://localhost:8002
SERVICE_API_KEY=shared_secret_for_microservices

# Docker Hub API
DOCKERHUB_API_URL=https://hub.docker.com/v2
DOCKERHUB_USERNAME=optional_for_private_images
DOCKERHUB_TOKEN=optional_for_private_images

# Redis (for caching and queuing)
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=10

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Security
MAX_SCAN_TIMEOUT=300000
BLOCK_CRITICAL_VULNERABILITIES=true
BLOCK_HIGH_VULNERABILITIES=false
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

- Integration with security-scanner microservice (Trivy-based)
- CVE database for known vulnerabilities
- Docker image layer-by-layer analysis
- Severity classification (Critical, High, Medium, Low)
- Automated alternative version suggestions

### Download Eligibility

- Block downloads if critical vulnerabilities detected
- Configurable severity thresholds
- Warning system for medium/high issues
- Detailed vulnerability reports
- Alternative version recommendations

### Configuration Security

- Port conflict detection across all services
- Missing environment variable identification
- Privileged container warnings
- Host network/PID namespace detection
- Unsafe volume mount validation
- Resource limit recommendations

### Misconfiguration Detection

- **Port Conflicts**: Scan all service port mappings for conflicts
- **Environment Variables**: Validate required env vars are set
- **Resource Limits**: Check CPU/memory constraints
- **Volume Mounts**: Validate paths and permissions
- **Network Configuration**: Check network settings
- **Dependency Order**: Validate depends_on relationships
- **Health Checks**: Ensure critical services have health checks

## Performance Considerations

- Request rate limiting
- Caching for templates and scan results
- Async processing for long-running scans
- Database indexing for efficient queries
