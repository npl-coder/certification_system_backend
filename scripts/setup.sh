#!/bin/bash

echo "🚀 Setting up NPL Coder Certification System for testing..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

print_success "Node.js is installed: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "npm is installed: $(npm --version)"

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
    print_warning "MySQL client not found. Make sure MySQL server is running."
else
    print_success "MySQL client is available"
fi

# Install dependencies
print_status "Installing dependencies..."
if npm install; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file from .env.sample..."
    cp .env.sample .env
    print_warning "Please edit .env file with your database credentials before starting the server"
else
    print_success ".env file already exists"
fi

# Create uploads directories
print_status "Creating upload directories..."
mkdir -p uploads/certificates uploads/csv uploads/templates
print_success "Upload directories created"

# Make scripts executable
chmod +x scripts/*.sh 2>/dev/null || true

print_success "Setup completed! 🎉"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your database credentials"
echo "2. Start MySQL server"
echo "3. Create database: CREATE DATABASE certification_system;"
echo "4. Run: npm run dev"
echo "5. Open test.html in your browser"
echo ""
echo "For testing:"
echo "- npm test (run automated tests)"
echo "- npm run dev (start development server)"
echo "- Open test.html for visual API testing"
