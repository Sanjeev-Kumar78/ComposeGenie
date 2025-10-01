# Docker Compose Generator - Microservices

## Overview

The services directory contains specialized microservices that handle specific aspects of security scanning, configuration validation, and template management for the Docker Compose Generator platform.

## Architecture

```
services/
├── security-scanner/     # Vulnerability scanning and CVE detection
├── config-validator/     # Misconfiguration detection and validation
└── template-generator/   # Template management and generation
```

## Services Overview

### 1. Security Scanner Service (Python/FastAPI)

**Purpose**: Performs comprehensive vulnerability scanning of Docker images before compose file download.

**Core Features**:

- **CVE Scanning**: Scan Docker images for known vulnerabilities using Trivy
- **Severity Assessment**: Classify vulnerabilities (Critical, High, Medium, Low)
- **Version Analysis**: Compare vulnerabilities across different image versions
- **Alternative Suggestions**: Recommend safer image versions when issues found
- **Download Blocking**: Prevent downloads if critical vulnerabilities detected
- **Detailed Reports**: Generate comprehensive security assessment reports

**Technology**: Python 3.9+, FastAPI, Trivy scanner, PostgreSQL, Redis

**Port**: 8001

### 2. Config Validator Service (Go/Gin)

**Purpose**: Validates Docker Compose configurations for misconfigurations and potential deployment issues.

**Core Features**:

- **Port Conflict Detection**: Identify overlapping port mappings across services
- **Environment Variable Validation**: Detect missing or misconfigured env vars
- **Resource Constraint Checks**: Validate CPU/memory limits
- **Volume Mount Validation**: Check volume paths and permissions
- **Network Configuration**: Validate network settings and connectivity
- **Dependency Analysis**: Check service dependencies and startup order
- **Best Practices**: Enforce Docker and security best practices

**Technology**: Go 1.19+, Gin framework, Docker API, YAML parser

**Port**: 8003

### 3. Template Generator Service (Node.js/Express)

**Purpose**: Manages pre-built templates and generates custom Docker Compose configurations.

**Core Features**:

- **Template Library**: Curated collection of common stacks (LAMP, MEAN, etc.)
- **Template CRUD**: Create, read, update, delete template operations
- **Dynamic Generation**: Generate templates based on user requirements
- **Version Management**: Template versioning and rollback capabilities
- **Validation**: Ensure template correctness before saving
- **Category Management**: Organize templates by use case

**Technology**: Node.js, Express.js, MongoDB, Handlebars

**Port**: 8002

## Workflow Integration

### Security Scanning Workflow

1. **Frontend**: User selects Docker images from catalog
2. **Backend API**: Sends scan request to Security Scanner service
3. **Security Scanner**:
   - Pulls image metadata from Docker Hub
   - Runs Trivy vulnerability scan
   - Analyzes CVE database
   - Generates severity report
   - Suggests alternative versions if needed
4. **Backend API**: Evaluates scan results
   - Blocks download if critical vulnerabilities found
   - Returns warnings for high/medium issues
   - Provides alternative version recommendations
5. **Frontend**: Displays results and alternatives to user

### Configuration Validation Workflow

1. **Frontend**: User builds compose configuration
2. **Backend API**: Sends validation request to Config Validator service
3. **Config Validator**:
   - Checks for port conflicts across services
   - Validates environment variables
   - Checks resource constraints
   - Validates volume mounts
   - Analyzes network configuration
   - Checks service dependencies
4. **Backend API**: Aggregates validation results
5. **Frontend**: Displays warnings and suggestions

### Pre-Download Checklist

Before allowing compose file download:

- ✅ No critical security vulnerabilities
- ✅ No port conflicts
- ✅ All required environment variables configured
- ✅ Valid resource constraints
- ✅ Proper volume mount configurations
- ✅ Valid network settings
- ⚠️ Warnings displayed for medium/low issues

## Inter-Service Communication

- **HTTP REST APIs**: Primary communication protocol
- **Redis Queue**: For async scanning and validation jobs
- **Message Format**: JSON for all API requests/responses
- **Authentication**: Service-to-service JWT tokens
- **Error Handling**: Standardized error response format
- **Retry Logic**: Automatic retry for failed requests
- **Timeout Management**: Configurable timeouts for long-running scans

## Service Endpoints

### Security Scanner (Port 8001)

- `POST /scan/image` - Scan a single Docker image
- `POST /scan/batch` - Scan multiple images
- `GET /scan/{scanId}/status` - Check scan progress
- `GET /scan/{scanId}/result` - Get scan results
- `GET /alternatives/{image}/{tag}` - Get safer alternatives
- `GET /vulnerabilities/{cve}` - Get CVE details

### Config Validator (Port 8003)

- `POST /validate/compose` - Validate complete compose file
- `POST /validate/ports` - Check port conflicts
- `POST /validate/environment` - Validate env variables
- `POST /validate/resources` - Check resource constraints
- `POST /validate/volumes` - Validate volume mounts
- `GET /validate/{validationId}/report` - Get validation report

### Template Generator (Port 8002)

- `GET /templates` - List all templates
- `GET /templates/{id}` - Get template details
- `POST /templates` - Create new template
- `PUT /templates/{id}` - Update template
- `DELETE /templates/{id}` - Delete template
- `POST /templates/generate` - Generate custom template

## Development Setup

### Prerequisites

- Docker and Docker Compose
- Python 3.9+ (for security-scanner)
- Go 1.19+ (for config-validator)
- Node.js 16+ (for template-generator)
- PostgreSQL 13+ (for scan results)
- MongoDB 4.4+ (for templates)
- Redis 6+ (for caching and queuing)

### Running Individual Services

#### Security Scanner

```bash
cd services/security-scanner
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

#### Config Validator

```bash
cd services/config-validator
go mod download
go run main.go
```

#### Template Generator

```bash
cd services/template-generator
npm install
npm run dev
```

### Running All Services with Docker Compose

```bash
cd services
docker-compose up -d
```

## Deployment

Each service can be deployed independently:

- **Docker Containers**: Individual Dockerfiles for each service
- **Kubernetes**: Deployment manifests for orchestration
- **Helm Charts**: Easy deployment and configuration
- **CI/CD Pipelines**: Automated testing and deployment
- **Health Checks**: Endpoint monitoring and auto-restart
- **Horizontal Scaling**: Load-based auto-scaling support

## Security Considerations

- **Service Authentication**: JWT-based service-to-service authentication
- **API Rate Limiting**: Prevent abuse and DoS attacks
- **Input Validation**: Strict validation of all inputs
- **Secrets Management**: Secure handling of API keys and credentials
- **Network Segmentation**: Services communicate through internal network
- **Regular Updates**: Automated security patching
- **Audit Logging**: Comprehensive logging of all operations
- **Vulnerability Database**: Regular updates from CVE feeds

## Monitoring and Logging

- **Centralized Logging**: ELK stack (Elasticsearch, Logstash, Kibana)
- **Distributed Tracing**: Jaeger for request tracing
- **Metrics Collection**: Prometheus for performance metrics
- **Dashboards**: Grafana for visualization
- **Health Checks**: `/health` endpoints for all services
- **Alerting**: PagerDuty/Slack integration for critical issues

## Current Status

### ✅ Implemented

- Basic project structure
- Service architecture design
- API endpoint specification
- Documentation

### 🚧 In Progress

- Security Scanner service implementation
- Config Validator service implementation
- Template Generator service implementation
- Backend API integration
- Frontend portal development

### 📋 Planned

- Docker Hub API integration
- Trivy scanner integration
- Port conflict detection algorithm
- Environment variable validation
- Alternative version suggestion engine
- Download eligibility checks
- Comprehensive testing suite
- CI/CD pipeline setup
