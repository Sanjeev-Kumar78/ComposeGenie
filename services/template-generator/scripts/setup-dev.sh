#!/bin/bash

# Development Setup Script
# This script sets up the development environment for the Template Generator Service

set -e

echo "🚀 Setting up Template Generator Service Development Environment"
echo "============================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)

if [ "$MAJOR_VERSION" -lt 16 ]; then
    echo "❌ Node.js version $NODE_VERSION is not supported. Please install Node.js 16 or higher."
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB before running the application."
    echo "   You can install MongoDB from: https://www.mongodb.com/try/download/community"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file. Please review and update the configuration as needed."
else
    echo "✅ .env file already exists"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p coverage

# Set up Git hooks (if in a Git repository)
if [ -d ".git" ]; then
    echo "🎣 Setting up Git hooks..."
    
    # Pre-commit hook for linting
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
echo "Running pre-commit checks..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting failed. Please fix the issues before committing."
    exit 1
fi
npm run test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Please fix the issues before committing."
    exit 1
fi
echo "✅ Pre-commit checks passed"
EOF
    
    chmod +x .git/hooks/pre-commit
    echo "✅ Git pre-commit hook installed"
fi

# Run initial tests
echo "🧪 Running initial tests..."
npm test

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Review and update the .env file with your configuration"
echo "2. Make sure MongoDB is running"
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "📚 Documentation:"
echo "   API Documentation: ./docs/API.md"
echo "   Project README: ./README.md"
echo ""
echo "🔗 Useful commands:"
echo "   npm run dev      - Start development server"
echo "   npm test         - Run tests"
echo "   npm run lint     - Check code quality"
echo "   npm run format   - Format code"
echo ""