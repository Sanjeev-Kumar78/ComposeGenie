@echo off
REM Development Setup Script for Windows
REM This script sets up the development environment for the Template Generator Service

echo 🚀 Setting up Template Generator Service Development Environment
echo =============================================================

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16 or higher.
    exit /b 1
)

REM Get Node.js version
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%

REM Check if MongoDB is running
tasklist /fi "imagename eq mongod.exe" 2>nul | find "mongod.exe" >nul
if %errorlevel% neq 0 (
    echo ⚠️  MongoDB is not running. Please start MongoDB before running the application.
    echo    You can install MongoDB from: https://www.mongodb.com/try/download/community
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Create environment file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ✅ Created .env file. Please review and update the configuration as needed.
) else (
    echo ✅ .env file already exists
)

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "coverage" mkdir coverage

REM Run initial tests
echo 🧪 Running initial tests...
call npm test

echo.
echo 🎉 Development environment setup complete!
echo.
echo Next steps:
echo 1. Review and update the .env file with your configuration
echo 2. Make sure MongoDB is running
echo 3. Start the development server:
echo    npm run dev
echo.
echo 📚 Documentation:
echo    API Documentation: ./docs/API.md
echo    Project README: ./README.md
echo.
echo 🔗 Useful commands:
echo    npm run dev      - Start development server
echo    npm test         - Run tests
echo    npm run lint     - Check code quality
echo    npm run format   - Format code
echo.

pause