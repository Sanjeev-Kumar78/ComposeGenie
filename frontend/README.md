# Docker Compose Generator - Frontend

## Overview

The frontend provides a user-friendly interface for visually assembling Docker services and generating production-ready docker-compose.yml files.

## Features (Planned)

- **Visual Service Builder**: Drag-and-drop interface for composing services
- **Template Gallery**: Pre-built templates for common application stacks
- **Security Dashboard**: Real-time vulnerability scanning results
- **Configuration Validator**: Automated checks for misconfigurations
- **Export Options**: CI-ready exports with different format options

## Technology Stack

- **React 19**: Modern React with hooks and functional components
- **React Router 7**: Client-side routing
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS 4**: Utility-first CSS framework

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Navbar.tsx          # Navigation component
│   ├── pages/
│   │   └── root.tsx            # Root/landing page
│   ├── assets/                 # Static assets (empty)
│   ├── styles/                 # Global styles (empty)
│   ├── App.tsx                 # Main App component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global CSS
├── public/                     # Public static assets (empty)
├── package.json                # Dependencies and scripts
└── vite.config.ts              # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

## Current Status

This is an early-stage project. The following components are currently implemented:

### Navbar

Navigation component for the application header.

### Root Page

Landing page with project information, FAQs, and introduction.

## Planned Components

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
