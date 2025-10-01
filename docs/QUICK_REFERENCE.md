# Docker Compose Generator - Quick Reference

## 🎯 Project Overview

A **public utility tool** for creating production-ready docker-compose files with:

- ✅ Docker Hub catalog integration
- ✅ Security vulnerability scanning (pre-download)
- ✅ Misconfiguration detection
- ✅ Alternative version suggestions
- ✅ No authentication required

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React 19)                     │
│                 http://localhost:3000                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND API (Node.js)                       │
│                 http://localhost:3001                       │
│  • Docker Hub Integration  • Rate Limiting                  │
│  • Security Coordination   • CORS Protection                │
└─────┬──────────────┬──────────────┬─────────────────────────┘
      │              │              │
      ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Security │  │  Config  │  │ Template │
│ Scanner  │  │Validator │  │Generator │
│ :8001    │  │  :8003   │  │  :8002   │
│ Python   │  │   Go     │  │ Node.js  │
└──────────┘  └──────────┘  └──────────┘
```

---

## 🔑 Key Design Decisions

### 1. **No Authentication** ✅

- **Why**: Public utility tool, no barriers to entry
- **Security**: IP-based rate limiting instead
- **Benefits**: Simpler UX, faster development, no user management

### 2. **Go for Config Validator** ✅

- **Why**: Performance-critical, needs concurrency
- **Benefits**:
  - 10x faster than Node.js/Python
  - Concurrent validation checks
  - Type-safe structure validation
  - Single binary deployment

### 3. **Rate Limiting** ✅

- **Anonymous Users**: 10 scans/hour per IP
- **Algorithm**: Sliding window
- **Protection**: Prevent abuse, ensure fair usage

---

## 🛡️ Security Measures (No Auth)

| Measure                 | Implementation     | Purpose               |
| ----------------------- | ------------------ | --------------------- |
| **Rate Limiting**       | Express Rate Limit | Prevent abuse         |
| **CORS**                | Helmet middleware  | Control API access    |
| **Input Validation**    | Joi schemas        | Prevent injection     |
| **Request Size Limits** | 1MB max            | Prevent DoS           |
| **XSS Protection**      | CSP headers        | Security headers      |
| **Service Auth**        | API keys           | Microservice security |
| **Audit Logging**       | Winston            | Track usage           |

---

## 🚀 Getting Started

### Prerequisites

```bash
# Required
Node.js 20+
Python 3.9+
Go 1.19+
MongoDB 4.4+
Redis 6+
Docker & Docker Compose
```

### Quick Start

```bash
# Clone repository
git clone https://github.com/Sanjeev-Kumar78/docker_compose_generator.git
cd docker_compose_generator

# Frontend
cd frontend
npm install
npm run dev
# → http://localhost:3000

# Backend
cd backend
npm install
npm run dev
# → http://localhost:3001

# Security Scanner
cd services/security-scanner
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
# → http://localhost:8001

# Config Validator
cd services/config-validator
go mod download
go run main.go
# → http://localhost:8003

# Template Generator
cd services/template-generator
npm install
npm run dev
# → http://localhost:8002
```

---

## 📊 Technology Stack

### Frontend

- **React 19**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS 4**: Styling
- **React Router 7**: Routing

### Backend API

- **Node.js + Express**: REST API
- **MongoDB**: Database
- **Express Rate Limit**: Throttling
- **Winston**: Logging
- **Joi**: Validation

### Microservices

| Service            | Tech              | Port | Purpose      |
| ------------------ | ----------------- | ---- | ------------ |
| Security Scanner   | Python + FastAPI  | 8001 | CVE scanning |
| Config Validator   | Go + Gin          | 8003 | Validation   |
| Template Generator | Node.js + Express | 8002 | Templates    |

### Infrastructure

- **Redis**: Caching
- **PostgreSQL**: Scan results
- **MongoDB**: Templates

---

## 🔗 API Endpoints

### Backend API (Port 3001)

#### Docker Hub Catalog

```
GET  /api/catalog/search
GET  /api/catalog/image/:name
GET  /api/catalog/image/:name/tags
```

#### Security

```
POST /api/security/scan
POST /api/security/check-eligibility
GET  /api/security/alternatives/:image/:tag
```

#### Validation

```
POST /api/validation/check
POST /api/validation/ports
POST /api/validation/environment
```

#### Compose

```
POST /api/compose/generate
POST /api/compose/validate
```

#### Templates

```
GET    /api/templates
GET    /api/templates/:id
POST   /api/templates
PUT    /api/templates/:id
DELETE /api/templates/:id
```

### Security Scanner (Port 8001)

```
POST /scan/image
POST /scan/batch
GET  /alternatives/{image}/{tag}
POST /check-eligibility
```

### Config Validator (Port 8003)

```
POST /validate/compose
POST /validate/ports
POST /validate/environment
POST /validate/resources
```

---

## 📝 Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=3001

# Database
MONGODB_URI=mongodb://localhost:27017/compose_generator

# Microservices
SECURITY_SCANNER_URL=http://localhost:8001
CONFIG_VALIDATOR_URL=http://localhost:8003
TEMPLATE_GENERATOR_URL=http://localhost:8002
SERVICE_API_KEY=shared_secret_key

# Docker Hub
DOCKERHUB_API_URL=https://hub.docker.com/v2

# Redis
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=10

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info

# Security
MAX_SCAN_TIMEOUT=300000
BLOCK_CRITICAL_VULNERABILITIES=true
```

---

## 📋 Implementation Status

### ✅ Completed

- Project structure
- Documentation
- Technology stack selection
- API design
- Architecture design

### 🚧 In Progress

- Frontend basic setup (React 19 + Vite)
- Backend API skeleton
- Service implementations

### 📋 Upcoming

- Docker Hub API integration
- Trivy scanner integration
- Port conflict detection algorithm
- Environment variable validation
- Alternative version suggestion engine
- Complete UI implementation
- Testing suite
- CI/CD pipeline
- Production deployment

---

## 🌟 Key Features Summary

1. **Docker Hub Integration** → Browse real services
2. **Pre-Download Security** → Scan before download
3. **Misconfiguration Detection** → Port conflicts, missing env vars
4. **Alternative Suggestions** → Safer image versions
5. **Intelligent Blocking** → Prevent vulnerable downloads
6. **Public Tool** → No authentication needed
7. **Rate Limited** → Fair usage for everyone
8. **Fast Validation** → Go-powered performance

---

**Made with ❤️ for the Docker community**
