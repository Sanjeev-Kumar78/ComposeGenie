# Docker Compose Generator - Frontend

## Overview
The frontend provides a user-friendly dashboard for visually assembling Docker services and generating production-ready docker-compose.yml files.

## Features
- **Visual Service Builder**: Drag-and-drop interface for composing services
- **Template Gallery**: Pre-built templates for common application stacks
- **Security Dashboard**: Real-time vulnerability scanning results
- **Configuration Validator**: Automated checks for misconfigurations
- **Export Options**: CI-ready exports with different format options

## Technology Stack
- **React 18**: Modern React with hooks and functional components
- **Material-UI**: Consistent and accessible UI components
- **React Flow**: Interactive node-based service composition
- **Axios**: HTTP client for API communication
- **YAML Parser**: For docker-compose file manipulation

## Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard/          # Main dashboard components
│   │   ├── ServiceBuilder/     # Visual service composition
│   │   ├── TemplateGallery/    # Pre-built templates
│   │   └── SecurityScanner/    # Security scanning UI
│   ├── pages/                  # Page components
│   ├── utils/                  # Utility functions
│   └── styles/                 # Global styles
├── public/                     # Static assets
└── package.json               # Dependencies and scripts
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Backend API running on port 3001

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm start
```

### Build for Production
```bash
npm run build
```

### Testing
```bash
npm test
```

## Key Components

### Dashboard
Main landing page with overview of projects, recent templates, and quick actions.

### Service Builder
Interactive canvas for:
- Adding services from a catalog
- Configuring service parameters
- Defining relationships and dependencies
- Real-time validation

### Security Scanner
Integration with vulnerability databases to:
- Scan selected images for known vulnerabilities
- Provide security recommendations
- Display compliance status

### Template Gallery
Curated collection of:
- Popular application stacks (LAMP, MEAN, etc.)
- Microservice patterns
- Development environments
- Production-ready configurations