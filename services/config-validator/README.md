# Config Validator Service

## Overview
A microservice that validates Docker Compose configurations for best practices, security issues, performance optimizations, and potential deployment problems.

## Features
- **Syntax Validation**: YAML syntax and Docker Compose schema validation
- **Security Analysis**: Identify security misconfigurations
- **Performance Optimization**: Resource usage and optimization suggestions
- **Best Practices**: Enforce Docker and containerization best practices
- **Dependency Analysis**: Service dependency validation and cycle detection

## Technology Stack
- **Go 1.19+**: High-performance runtime
- **Gin**: Web framework
- **Docker API**: Container runtime integration
- **YAML Parser**: Configuration parsing
- **Validator**: Rule-based validation engine

## Validation Categories

### Security Validations
- Privileged containers detection
- Host network/PID namespace usage
- Unsafe volume mounts
- Missing user specifications
- Exposed sensitive ports
- Weak secrets management

### Performance Validations
- Resource limits configuration
- Memory and CPU constraints
- Health check configurations
- Restart policy optimization
- Network configuration efficiency

### Best Practices
- Image tag specificity (avoid 'latest')
- Service naming conventions
- Label standardization
- Volume usage patterns
- Network segmentation

## API Endpoints
- `POST /validate/compose` - Validate complete docker-compose file
- `POST /validate/service` - Validate individual service configuration
- `GET /validate/rules` - Get available validation rules
- `POST /validate/custom` - Apply custom validation rules
- `GET /validate/{validation_id}` - Get validation results

## Validation Response
```json
{
  "valid": false,
  "score": 75,
  "issues": [
    {
      "severity": "high",
      "category": "security",
      "rule": "privileged_container",
      "message": "Service 'web' is running in privileged mode",
      "line": 15,
      "suggestion": "Remove 'privileged: true' or use specific capabilities"
    }
  ],
  "recommendations": [
    {
      "category": "performance",
      "message": "Add resource limits to prevent resource starvation",
      "services": ["web", "api"]
    }
  ]
}
```

## Usage Example
```bash
curl -X POST "http://localhost:8003/validate/compose" \
  -H "Content-Type: application/json" \
  -d '{"compose_file": "version: \"3.8\"\nservices:\n  web:\n    image: nginx:latest"}'
```

## Configuration
Environment variables:
- `VALIDATION_RULES_PATH`: Path to custom validation rules
- `SEVERITY_THRESHOLD`: Minimum severity level to report
- `DOCKER_API_VERSION`: Docker API version to use
- `CACHE_TTL`: Validation result cache duration