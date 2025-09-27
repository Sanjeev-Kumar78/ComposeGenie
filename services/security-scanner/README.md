# Security Scanner Service

## Overview
A specialized microservice for performing comprehensive security scanning of Docker images and configurations used in docker-compose files.

## Features
- **Vulnerability Scanning**: Scan Docker images for known CVEs
- **Configuration Security**: Analyze docker-compose configurations for security issues
- **Compliance Checking**: Validate against security standards (CIS, NIST)
- **Real-time Updates**: Continuously updated vulnerability database
- **Risk Assessment**: Categorize and prioritize security findings

## Technology Stack
- **Python 3.9+**: Core runtime
- **FastAPI**: Web framework for APIs
- **Trivy**: Vulnerability scanner integration
- **PostgreSQL**: Scan results storage
- **Redis**: Caching and job queuing
- **Celery**: Background task processing

## API Endpoints
- `POST /scan/image` - Scan a Docker image
- `POST /scan/compose` - Scan a docker-compose configuration
- `GET /scan/{scan_id}` - Get scan results
- `GET /scan/{scan_id}/report` - Get formatted report
- `GET /vulnerabilities/{cve_id}` - Get CVE details

## Usage Example
```bash
curl -X POST "http://localhost:8001/scan/image" \
  -H "Content-Type: application/json" \
  -d '{"image": "nginx:latest", "registry": "docker.io"}'
```

## Configuration
Environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `TRIVY_DB_PATH`: Path to Trivy database
- `LOG_LEVEL`: Logging level (DEBUG, INFO, WARN, ERROR)

## Security Features
- Image signature verification
- Registry authentication support
- Secure secrets scanning
- Malware detection
- License compliance checking