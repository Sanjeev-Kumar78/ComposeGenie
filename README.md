# Docker Compose Generator Web

A comprehensive, user-friendly web platform for visually assembling Docker services, generating production-ready docker-compose.yml files, and running automated security and configuration checks before deployment.

## 🚀 Overview

Unlike existing catalog-only generators, **Compose Generator Web** integrates advanced features including vulnerability scanning, misconfiguration detection, and CI-ready exports, making it a complete solution for containerized application deployment.

## ✨ Key Features

### 🎨 Visual Service Builder
- **Drag & Drop Interface**: Intuitive canvas for composing services
- **Real-time Preview**: Live docker-compose.yml generation
- **Service Relationships**: Visual dependency mapping
- **Template Integration**: Start from pre-built templates

### 🔒 Integrated Security
- **Vulnerability Scanning**: Automated CVE detection in Docker images
- **Configuration Security**: Identify security misconfigurations
- **Compliance Checking**: Validate against CIS and NIST standards
- **Risk Assessment**: Prioritized security recommendations

### ⚡ Smart Validation
- **Configuration Analysis**: Detect potential deployment issues
- **Performance Optimization**: Resource usage recommendations  
- **Best Practices**: Enforce Docker containerization standards
- **Dependency Resolution**: Automatic service dependency analysis

### 📦 Export & Integration
- **Multiple Formats**: Docker Compose, Docker Swarm, Kubernetes
- **CI/CD Ready**: Generate pipeline-compatible configurations
- **Version Control**: Git-friendly structured outputs
- **Environment Variants**: Development, staging, production configs

## 🏗️ Architecture

```
docker_compose_generator/
├── frontend/              # React-based web dashboard
│   ├── src/components/   # UI components (Dashboard, Builder, Scanner)
│   └── src/pages/        # Application pages
├── backend/              # Node.js API server
│   ├── src/routes/       # REST API endpoints
│   ├── src/controllers/  # Request handlers
│   └── src/services/     # Business logic
└── services/             # Specialized microservices
    ├── security-scanner/ # Vulnerability scanning (Python/FastAPI)
    ├── template-generator/ # Template management (Node.js)
    └── config-validator/  # Configuration validation (Go)
```

## 🛠️ Technology Stack

### Frontend
- **React 18** with modern hooks
- **Material-UI** for consistent design
- **React Flow** for visual service composition
- **YAML** parsing and manipulation

### Backend
- **Node.js** with Express framework
- **MongoDB** for data persistence
- **JWT** authentication
- **Winston** structured logging

### Microservices
- **Python/FastAPI** (Security Scanner)
- **Node.js/Express** (Template Generator)  
- **Go/Gin** (Config Validator)
- **Redis** for caching and queuing
- **PostgreSQL** for scan results

## 🚦 Getting Started

### Prerequisites
- Node.js 16+
- Python 3.9+
- Go 1.19+
- MongoDB 4.4+
- Redis 6+
- Docker & Docker Compose

### Quick Start
```bash
# Clone the repository
git clone https://github.com/Sanjeev-Kumar78/docker_compose_generator.git
cd docker_compose_generator

# Start all services with Docker Compose
docker-compose up -d

# Or run individual components:

# Frontend (React App)
cd frontend && npm install && npm start

# Backend API
cd backend && npm install && npm run dev

# Microservices
cd services/security-scanner && python -m uvicorn main:app --reload
cd services/template-generator && npm run dev
cd services/config-validator && go run main.go
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Security Scanner**: http://localhost:8001
- **Template Generator**: http://localhost:8002
- **Config Validator**: http://localhost:8003

## 🎯 Use Cases

### Development Teams
- **Rapid Prototyping**: Quickly assemble development environments
- **Standardization**: Consistent configurations across team members
- **Learning Tool**: Visual understanding of service relationships

### DevOps Engineers
- **Production Deployment**: Generate secure, optimized configurations
- **Security Compliance**: Automated security validation
- **CI/CD Integration**: Pipeline-ready configuration exports

### Platform Teams
- **Template Management**: Curated service templates and patterns
- **Governance**: Enforce organizational standards and policies
- **Self-Service**: Enable developers to deploy safely

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTOR.md](CONTRIBUTOR.md) for guidelines on:
- Setting up the development environment
- Code style and standards
- Submitting pull requests
- Reporting issues

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Roadmap

- [ ] Advanced template marketplace
- [ ] GitOps integration
- [ ] Multi-cloud deployment support
- [ ] Advanced monitoring integration
- [ ] Plugin system for custom validators
- [ ] Team collaboration features

## 📞 Support

- **Documentation**: [Wiki](https://github.com/Sanjeev-Kumar78/docker_compose_generator/wiki)
- **Issues**: [GitHub Issues](https://github.com/Sanjeev-Kumar78/docker_compose_generator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Sanjeev-Kumar78/docker_compose_generator/discussions)

---

**Made with ❤️ for the Docker community**