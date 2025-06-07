#!/bin/bash

# Database setup script for NPL Coder Certification System

echo "🗄️  Setting up database for NPL Coder Certification System..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ .env file not found. Please create it from .env.sample"
    exit 1
fi

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Default values if not set in .env
DB_HOST=${DB_HOST:-localhost}
DB_USER=${DB_USER:-root}
DB_NAME=${DB_NAME:-certification_system}

echo "Database Configuration:"
echo "Host: $DB_HOST"
echo "User: $DB_USER"
echo "Database: $DB_NAME"
echo ""

# Function to run MySQL command
run_mysql() {
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" -e "$1" 2>/dev/null
}

# Check if MySQL is accessible
echo "Testing MySQL connection..."
if run_mysql "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MySQL connection successful${NC}"
else
    echo -e "${RED}❌ MySQL connection failed${NC}"
    echo "Please check your database credentials in .env file"
    exit 1
fi

# Create main database
echo "Creating main database: $DB_NAME"
if run_mysql "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;"; then
    echo -e "${GREEN}✅ Main database created/verified${NC}"
else
    echo -e "${RED}❌ Failed to create main database${NC}"
    exit 1
fi

# Create test database
TEST_DB_NAME="${DB_NAME}_test"
echo "Creating test database: $TEST_DB_NAME"
if run_mysql "CREATE DATABASE IF NOT EXISTS \`$TEST_DB_NAME\`;"; then
    echo -e "${GREEN}✅ Test database created/verified${NC}"
else
    echo -e "${RED}❌ Failed to create test database${NC}"
    exit 1
fi

# Show databases
echo ""
echo "Current databases:"
run_mysql "SHOW DATABASES LIKE '%${DB_NAME}%';" | tail -n +2

echo ""
echo -e "${GREEN}🎉 Database setup completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev (to start the server and sync tables)"
echo "2. Open test.html in browser for API testing"
echo "3. Run: npm test (for automated testing)"
