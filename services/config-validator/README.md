# Config Validator Service

## Overview

A high-performance microservice that validates Docker Compose configurations for misconfigurations, deployment issues, and best practice violations. It detects port conflicts, missing environment variables, and other common problems before deployment.

## Core Features

### 🔌 Port Conflict Detection

- **Cross-Service Analysis**: Check all services for overlapping port mappings
- **Host Port Conflicts**: Detect conflicts with host system ports
- **Range Validation**: Validate port ranges (1-65535)
- **Protocol Conflicts**: Check TCP/UDP protocol specifications
- **Automatic Resolution**: Suggest alternative ports

### 📝 Environment Variable Validation

- **Required Variable Detection**: Identify missing required env vars
- **Format Validation**: Check variable format and syntax
- **Secret Detection**: Warn about hardcoded secrets
- **Default Values**: Suggest default values for common variables
- **Documentation**: Link to service-specific env var docs

### 💾 Resource Configuration

- **Memory Limits**: Validate memory constraints are set
- **CPU Limits**: Check CPU allocation settings
- **Resource Ratios**: Ensure reservations ≤ limits
- **System Capacity**: Warn if total exceeds typical system resources
- **Performance Recommendations**: Suggest optimal resource allocation

### 🔐 Security Validation

- **Privileged Containers**: Detect and warn about privileged mode
- **Host Namespace**: Check for host network/PID namespace usage
- **Unsafe Mounts**: Validate volume mount paths and permissions
- **Capability Checks**: Analyze Linux capabilities assignments
- **User Specifications**: Ensure non-root users where applicable

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

### Complete Validation

- `POST /validate/compose` - Validate entire docker-compose configuration
  ```json
  {
    "compose": {
      "version": "3.8",
      "services": { ... }
    }
  }
  ```

### Specific Validations

- `POST /validate/ports` - Check for port conflicts

  ```json
  {
    "services": {
      "web": { "ports": ["80:80"] },
      "api": { "ports": ["80:8080"] }
    }
  }
  ```

- `POST /validate/environment` - Validate environment variables

  ```json
  {
    "service": "postgres",
    "environment": {
      "POSTGRES_DB": "mydb"
    }
  }
  ```

- `POST /validate/resources` - Check resource constraints
- `POST /validate/volumes` - Validate volume mounts
- `POST /validate/networks` - Check network configuration
- `POST /validate/dependencies` - Validate service dependencies

### Results & Reports

- `GET /validate/{validationId}/report` - Get detailed validation report
- `GET /validate/rules` - Get available validation rules
- `POST /validate/custom` - Apply custom validation rules

## Validation Response Format

```json
{
  "validationId": "val_xyz789",
  "timestamp": "2025-10-01T10:30:00Z",
  "overall": {
    "valid": false,
    "score": 75,
    "blockers": 2,
    "warnings": 5,
    "suggestions": 8
  },
  "issues": [
    {
      "id": "port_conflict_001",
      "severity": "blocker",
      "category": "port_conflict",
      "service": "web",
      "message": "Port 80 is already used by service 'nginx'",
      "line": 12,
      "suggestion": "Use port 8080 instead: '8080:80'",
      "autoFix": true
    },
    {
      "id": "env_missing_002",
      "severity": "warning",
      "category": "environment",
      "service": "postgres",
      "message": "Missing required environment variable: POSTGRES_PASSWORD",
      "line": 25,
      "suggestion": "Add: POSTGRES_PASSWORD=<your_password>",
      "documentation": "https://hub.docker.com/_/postgres"
    }
  ],
  "recommendations": [
    "Add health checks to critical services",
    "Specify resource limits for all services",
    "Use specific image tags instead of 'latest'"
  ]
}
```

"recommendations": [
{
"category": "performance",
"message": "Add resource limits to prevent resource starvation",
"services": ["web", "api"]
}
]
}

````

## Usage Example
```bash
curl -X POST "http://localhost:8003/validate/compose" \
  -H "Content-Type: application/json" \
  -d '{"compose_file": "version: \"3.8\"\nservices:\n  web:\n    image: nginx:latest"}'
````

## Validation Algorithms

### Port Conflict Detection Algorithm

```
1. Extract all port mappings from all services
2. Parse format: "host_port:container_port" or "host_port:container_port/protocol"
3. Group by host port and protocol
4. If any host port appears > 1 time: CONFLICT
5. Check against common system ports (22, 25, 53, etc.)
6. Suggest next available port in range
```

### Missing Environment Variable Detection

```
1. Identify service image (e.g., "postgres:13")
2. Lookup service in env var database
3. Get list of required/recommended env vars
4. Compare with user-provided env vars
5. Flag missing required variables as BLOCKER
6. Flag missing recommended variables as WARNING
7. Provide documentation links
```

### Resource Validation

```
1. Check if memory_limit exists for each service
2. Validate format (e.g., "512m", "2g")
3. Check if cpu_limit exists
4. Ensure: memory_reservation ≤ memory_limit
5. Ensure: cpu_reservation ≤ cpu_limit
6. Sum all limits and warn if > 80% typical system capacity
```

## Configuration

Environment variables:

- `PORT`: Service port (default: 8003)
- `VALIDATION_RULES_PATH`: Path to custom validation rules
- `SEVERITY_THRESHOLD`: Minimum severity level to report (blocker, warning, suggestion)
- `DOCKER_API_VERSION`: Docker API version to use
- `CACHE_TTL`: Validation result cache duration in seconds
- `ENV_VAR_DB_PATH`: Path to environment variable database
- `SYSTEM_PORTS_FILE`: Path to system reserved ports list
- `MAX_VALIDATION_TIME`: Maximum validation time in seconds
- `LOG_LEVEL`: Logging level

## Built-in Validation Rules

### Blockers (Must Fix)

- Port conflicts between services
- Missing required environment variables
- Invalid YAML syntax
- Invalid Docker Compose schema
- Circular service dependencies

### Warnings (Should Fix)

- Missing recommended environment variables
- No resource limits specified
- Using 'latest' tag for images
- Privileged containers
- Host network mode
- Missing health checks for critical services

### Suggestions (Consider)

- Add labels for better organization
- Use named volumes instead of bind mounts
- Implement restart policies
- Add logging configuration
- Use secrets for sensitive data
