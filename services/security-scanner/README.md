# Security Scanner Service

## Overview

A specialized microservice for performing comprehensive security scanning of Docker images before allowing compose file downloads. It scans for vulnerabilities, assesses severity, and suggests alternative versions when security issues are detected.

## Core Features

### 🔍 Vulnerability Scanning

- **CVE Detection**: Scan Docker images for known Common Vulnerabilities and Exposures
- **Layer Analysis**: Deep scan of all image layers for security issues
- **Multi-Database**: Query multiple vulnerability databases (NVD, Alpine, Debian, etc.)
- **Real-time Updates**: Continuously updated vulnerability database

### 📊 Severity Assessment

- **Classification**: Categorize vulnerabilities (Critical, High, Medium, Low)
- **CVSS Scoring**: Use Common Vulnerability Scoring System for severity
- **Risk Analysis**: Calculate overall image risk score
- **Exploitability**: Identify actively exploited vulnerabilities

### 🔄 Alternative Version Suggestions

- **Version Comparison**: Scan multiple versions of the same image
- **Smart Recommendations**: Suggest nearest safer version
- **Patch Detection**: Identify versions with security patches
- **Compatibility Checks**: Consider version compatibility

### 🚫 Download Control

- **Critical Blocking**: Prevent downloads with critical vulnerabilities
- **Configurable Thresholds**: Customize blocking severity levels
- **Override Options**: Allow admin override with justification
- **Audit Trail**: Log all scan results and decisions

## Technology Stack

- **Python 3.9+**: Core runtime
- **FastAPI**: Web framework for APIs
- **Trivy**: Vulnerability scanner integration
- **PostgreSQL**: Scan results storage
- **Redis**: Caching and job queuing
- **Celery**: Background task processing

## API Endpoints

### Image Scanning

- `POST /scan/image` - Scan a single Docker image

  ```json
  {
    "image": "nginx",
    "tag": "1.21.0",
    "registry": "docker.io"
  }
  ```

- `POST /scan/batch` - Scan multiple images in one request

  ```json
  {
    "images": [
      { "image": "nginx", "tag": "latest" },
      { "image": "postgres", "tag": "13" }
    ]
  }
  ```

- `GET /scan/{scanId}/status` - Check scan progress
- `GET /scan/{scanId}/result` - Get complete scan results

### Alternative Versions

- `GET /alternatives/{image}/{tag}` - Get safer alternative versions

  - Returns sorted list of versions with fewer/no vulnerabilities
  - Includes vulnerability counts for each version

- `POST /alternatives/compare` - Compare multiple versions
  ```json
  {
    "image": "nginx",
    "tags": ["1.21.0", "1.21.1", "1.21.2", "latest"]
  }
  ```

### Download Eligibility

- `POST /check-eligibility` - Check if images can be downloaded
  ```json
  {
    "images": [
      { "image": "nginx", "tag": "1.21.0" },
      { "image": "postgres", "tag": "13" }
    ],
    "threshold": "critical"
  }
  ```
  Response:
  ```json
  {
    "eligible": false,
    "blockers": ["nginx:1.21.0 has 2 critical vulnerabilities"],
    "warnings": ["postgres:13 has 5 high vulnerabilities"],
    "alternatives": {
      "nginx": ["1.21.3", "1.22.0"],
      "postgres": ["13.8", "14.5"]
    }
  }
  ```

### Vulnerability Details

- `GET /vulnerabilities/{cve}` - Get detailed CVE information
- `GET /vulnerabilities/stats` - Get vulnerability database statistics

## Usage Example

```bash
curl -X POST "http://localhost:8001/scan/image" \
  -H "Content-Type: application/json" \
  -d '{"image": "nginx:latest", "registry": "docker.io"}'
```

## Configuration

Environment variables:

- `DATABASE_URL`: PostgreSQL connection string for scan results
- `REDIS_URL`: Redis connection string for job queuing
- `TRIVY_DB_PATH`: Path to Trivy vulnerability database
- `TRIVY_CACHE_DIR`: Cache directory for scanned images
- `LOG_LEVEL`: Logging level (DEBUG, INFO, WARN, ERROR)
- `SCAN_TIMEOUT`: Maximum scan duration in seconds (default: 300)
- `CRITICAL_BLOCK`: Block downloads with critical vulns (default: true)
- `HIGH_BLOCK`: Block downloads with high vulns (default: false)
- `MAX_ALTERNATIVES`: Max alternative versions to suggest (default: 5)
- `PARALLEL_SCANS`: Number of concurrent scans (default: 3)

## Scan Result Format

```json
{
  "scanId": "scan_abc123",
  "timestamp": "2025-10-01T10:30:00Z",
  "image": "nginx",
  "tag": "1.21.0",
  "status": "completed",
  "summary": {
    "critical": 2,
    "high": 5,
    "medium": 12,
    "low": 8,
    "total": 27
  },
  "vulnerabilities": [
    {
      "cve": "CVE-2021-12345",
      "severity": "CRITICAL",
      "score": 9.8,
      "package": "openssl",
      "installedVersion": "1.1.1k",
      "fixedVersion": "1.1.1l",
      "description": "Buffer overflow in OpenSSL...",
      "references": ["https://cve.mitre.org/..."]
    }
  ],
  "recommendation": {
    "action": "block",
    "reason": "Contains critical vulnerabilities",
    "alternatives": ["nginx:1.21.3", "nginx:1.22.0"]
  }
}
```

## Security Features

- **Image Signature Verification**: Verify Docker Content Trust signatures
- **Registry Authentication**: Support for private registries
- **Secrets Scanning**: Detect exposed API keys, passwords, tokens
- **Malware Detection**: Basic malware signature scanning
- **License Compliance**: Check for GPL and restrictive licenses
- **Supply Chain Security**: Validate base image provenance

## Algorithm: Alternative Version Suggestion

1. **Extract Image Details**: Parse image name and current tag
2. **Fetch Available Tags**: Query Docker Hub API for all versions
3. **Filter Candidates**:
   - Same major version (for stability)
   - Newer or equal to current version
   - Exclude beta/alpha/rc tags (unless specified)
4. **Scan Candidates**: Perform vulnerability scan on each candidate
5. **Score & Rank**:
   - Prioritize versions with zero critical/high vulns
   - Consider proximity to current version
   - Factor in image popularity (pulls)
6. **Return Top Alternatives**: Return 3-5 best alternatives

## Performance Optimization

- **Cache Scan Results**: Store results for 24 hours
- **Parallel Scanning**: Scan multiple images concurrently
- **Incremental Updates**: Only rescan when new vulns published
- **Database Indexing**: Fast CVE lookup with indexed database
- **Rate Limiting**: Respect Docker Hub API rate limits
