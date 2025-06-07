#!/bin/bash

# Test runner script with multiple options

echo "🧪 NPL Coder Certification System - Test Runner"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_option() {
    echo -e "${BLUE}$1)${NC} $2"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if server is running
check_server() {
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Main menu
echo "Select testing option:"
echo ""
print_option "1" "Run automated Jest tests"
print_option "2" "Run tests with coverage report"
print_option "3" "Start development server"
print_option "4" "Open test.html in browser"
print_option "5" "Run database model test"
print_option "6" "Test API health check"
print_option "7" "Run all tests (Jest + Health check)"
print_option "8" "Exit"
echo ""

read -p "Enter your choice (1-8): " choice

case $choice in
    1)
        echo "Running Jest tests..."
        npm test
        ;;
    2)
        echo "Running tests with coverage..."
        npm test -- --coverage
        ;;
    3)
        echo "Starting development server..."
        echo "Server will be available at http://localhost:3000"
        echo "Press Ctrl+C to stop"
        npm run dev
        ;;
    4)
        if check_server; then
            print_success "Server is running at http://localhost:3000"
        else
            print_error "Server is not running. Start it first with option 3"
            echo "Starting server in background..."
            npm run dev &
            SERVER_PID=$!
            sleep 3
        fi
        
        echo "Opening test.html in browser..."
        if command -v open &> /dev/null; then
            open test.html
        elif command -v xdg-open &> /dev/null; then
            xdg-open test.html
        else
            echo "Please open test.html manually in your browser"
        fi
        ;;
    5)
        echo "Running database model test..."
        node test.js
        ;;
    6)
        echo "Testing API health check..."
        if check_server; then
            print_success "Server is running and healthy"
            curl -s http://localhost:3000/health | jq . 2>/dev/null || curl -s http://localhost:3000/health
        else
            print_error "Server is not running or not responding"
            echo "Start the server with: npm run dev"
        fi
        ;;
    7)
        echo "Running comprehensive tests..."
        echo ""
        echo "1. Testing API health..."
        if check_server; then
            print_success "Server is healthy"
        else
            print_error "Server is not running"
            exit 1
        fi
        
        echo ""
        echo "2. Running Jest tests..."
        npm test
        
        echo ""
        echo "3. Running database model test..."
        node test.js
        
        print_success "All tests completed!"
        ;;
    8)
        echo "Goodbye! 👋"
        exit 0
        ;;
    *)
        print_error "Invalid option. Please select 1-8."
        exit 1
        ;;
esac
