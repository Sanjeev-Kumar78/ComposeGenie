# Docker Compose Generator - System Architecture

## Project Vision

Docker Compose Generator is a production-ready web portal for creating secure docker-compose files. It integrates Docker Hub catalog browsing, automated security vulnerability scanning, misconfiguration detection, and intelligent version recommendations - ensuring safe deployments before file download.

## Key Differentiators

1. **Pre-Download Security**: Scan images for vulnerabilities BEFORE allowing download
2. **Misconfiguration Prevention**: Detect port conflicts, missing env vars, resource issues
3. **Alternative Suggestions**: Recommend safer image versions when vulnerabilities found
4. **Docker Hub Integration**: Real-time catalog fetching from Docker Hub
5. **Intelligent Blocking**: Prevent downloads with critical security issues

## System Components

### Frontend (React 19 + TypeScript + Vite)

**Location**: `/frontend`

**Responsibilities**:

- Service catalog browser (Docker Hub integration)
- Docker Compose visual builder
- Security scan dashboard
- Misconfiguration warnings display
- Alternative version suggestions UI
- Download eligibility checker

**Key Technologies**: React 19, TypeScript, Tailwind CSS 4, React Router 7, Vite

### Backend API (Node.js + Express)

**Location**: `/backend`

**Responsibilities**:

- Docker Hub API integration
- Coordinate security scanning
- Aggregate validation results
- Compose file generation
- Download eligibility determination
- Template management

**Key Technologies**: Node.js, Express, MongoDB, Winston, Express Rate Limit

### Microservices

#### 1. Security Scanner Service (Python + FastAPI)

**Location**: `/services/security-scanner`
**Port**: 8001

**Responsibilities**:

- CVE vulnerability scanning (Trivy integration)
- Severity assessment (Critical/High/Medium/Low)
- Version comparison
- Alternative version suggestions
- Download blocking decisions

#### 2. Config Validator Service (Go + Gin)

**Location**: `/services/config-validator`
**Port**: 8003

**Responsibilities**:

- Port conflict detection
- Environment variable validation
- Resource constraint checks
- Volume mount validation
- Network configuration checks
- Dependency analysis

#### 3. Template Generator Service (Node.js + Express)

**Location**: `/services/template-generator`
**Port**: 8002

**Responsibilities**:

- Pre-built template management
- Template CRUD operations
- Custom template generation
- Template validation

## Data Flow

### Compose File Creation Flow

```
1. User browses Docker Hub catalog → Frontend
2. Frontend requests service list → Backend API
3. Backend fetches from Docker Hub API
4. User selects services and versions
5. User builds compose configuration
6. User requests download
7. Backend triggers security scan → Security Scanner
8. Backend triggers validation → Config Validator
9. Backend aggregates results
10. If PASS: Generate and return compose file
11. If FAIL: Show issues + alternatives
```

### Security Scanning Flow

```
1. Security Scanner receives image list
2. For each image:
   - Fetch image metadata
   - Run Trivy vulnerability scan
   - Classify vulnerabilities by severity
   - Query for alternative versions
   - Scan alternatives
3. Generate recommendation:
   - BLOCK if critical vulnerabilities
   - WARN if high/medium vulnerabilities
   - SUGGEST alternative versions
4. Return results to Backend API
```

### Misconfiguration Detection Flow

```
1. Config Validator receives compose config
2. Port Conflict Check:
   - Extract all port mappings
   - Identify duplicates
   - Suggest alternatives
3. Environment Variable Check:
   - Identify service type
   - Lookup required env vars
   - Flag missing variables
4. Resource Check:
   - Validate limits and reservations
   - Check total resource allocation
5. Return validation report
```

## API Architecture

### Backend API Endpoints

#### Docker Hub Catalog

- `GET /api/catalog/search` - Search images
- `GET /api/catalog/image/:name` - Get image details
- `GET /api/catalog/image/:name/tags` - Get versions

#### Security

- `POST /api/security/scan` - Scan images
- `POST /api/security/check-eligibility` - Check download eligibility
- `GET /api/security/alternatives/:image/:tag` - Get safer versions

#### Validation

- `POST /api/validation/check` - Validate configuration
- `POST /api/validation/ports` - Check port conflicts
- `POST /api/validation/environment` - Check env vars

#### Compose

- `POST /api/compose/generate` - Generate compose file
- `POST /api/compose/validate` - Validate compose config

### Microservice APIs

#### Security Scanner (Port 8001)

- `POST /scan/image` - Scan single image
- `POST /scan/batch` - Scan multiple images
- `GET /alternatives/{image}/{tag}` - Get safer versions
- `POST /check-eligibility` - Check download eligibility

#### Config Validator (Port 8003)

- `POST /validate/compose` - Validate complete config
- `POST /validate/ports` - Check port conflicts
- `POST /validate/environment` - Validate env vars
- `POST /validate/resources` - Check resources

#### Template Generator (Port 8002)

- `GET /templates` - List templates
- `POST /templates` - Create template
- `POST /templates/generate` - Generate custom template

## Database Schema

### MongoDB Collections

#### Templates

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  category: String,
  services: Object,
  networks: Object,
  volumes: Object,
  tags: [String],
  version: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### ScanCache

```javascript
{
  _id: ObjectId,
  imageHash: String,        // Hash of image:tag for fast lookup
  imageName: String,
  imageTag: String,
  scanResults: Object,
  expiresAt: Date,
  createdAt: Date
}
```

#### RequestLogs

```javascript
{
  _id: ObjectId,
  ip: String,
  endpoint: String,
  timestamp: Date,
  requestCount: Number
}
```

### PostgreSQL Tables

#### ScanResults

```sql
CREATE TABLE scan_results (
  id SERIAL PRIMARY KEY,
  scan_id VARCHAR(255) UNIQUE,
  image_name VARCHAR(255),
  image_tag VARCHAR(255),
  critical_count INTEGER,
  high_count INTEGER,
  medium_count INTEGER,
  low_count INTEGER,
  vulnerabilities JSONB,
  alternatives JSONB,
  recommendation TEXT,
  scan_date TIMESTAMP,
  created_at TIMESTAMP
);
```

## Security Measures

1. **Rate Limiting**: IP-based request throttling to prevent abuse
   - Anonymous users: 10 scans per hour
   - Sliding window algorithm
   - Per-endpoint rate limits
2. **CORS Protection**: Configured allowed origins and methods
3. **Input Validation**: Strict sanitization of all inputs
   - Schema validation with Joi/Zod
   - YAML/JSON parsing limits
   - Image name format validation
4. **HTTPS Only**: Encrypted communication in production
5. **Request Size Limits**: Prevent large payload attacks
6. **XSS Protection**: Content Security Policy headers
7. **API Key for Microservices**: Shared secrets for inter-service communication
8. **Audit Logging**: Track all scans and validation requests

## Deployment Architecture

### Development

- Local Docker Compose setup
- Hot reload for all services
- Shared network for inter-service communication

### Production

- Kubernetes deployment
- Horizontal pod autoscaling
- Load balancing
- Service mesh for communication
- Centralized logging (ELK)
- Monitoring (Prometheus + Grafana)

## Current Implementation Status

### ✅ Completed

- Project structure
- Documentation
- Technology stack selection
- API design
- Architecture design

### 🚧 In Progress

- Frontend basic setup (React 19 + Vite)
- Service implementations
- API development

### 📋 Upcoming

- Docker Hub API integration
- Trivy scanner integration
- Port conflict detection
- Environment variable validation
- Alternative version suggestion engine
- Complete UI implementation
- Testing suite
- CI/CD pipeline
- Production deployment

## Performance Considerations

1. **Caching**: Redis for scan results and Docker Hub responses
2. **Parallel Processing**: Concurrent image scanning
3. **Database Indexing**: Fast queries on scan results
4. **Rate Limiting**: Respect Docker Hub API limits
5. **Async Processing**: Background jobs for long-running scans
6. **CDN**: Static asset delivery

## Monitoring & Observability

1. **Health Checks**: `/health` endpoints on all services
2. **Metrics**: Prometheus metrics collection
3. **Logging**: Centralized logging with ELK stack
4. **Tracing**: Distributed tracing with Jaeger
5. **Alerts**: PagerDuty/Slack for critical issues
6. **Dashboards**: Grafana for visualization
