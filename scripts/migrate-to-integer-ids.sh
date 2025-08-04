#!/bin/bash

# Migration script to convert UUID IDs to Integer IDs
# IMPORTANT: This will drop and recreate tables, losing all data!

echo "🔄 Converting database from UUID to Integer IDs..."

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
    mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "$1" 2>/dev/null
}

# Warning
echo -e "${YELLOW}⚠️  WARNING: This migration will DROP ALL EXISTING DATA!${NC}"
echo -e "${YELLOW}   Make sure you have a backup before proceeding.${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Migration cancelled."
    exit 0
fi

echo "Starting migration..."

# Drop existing tables (in reverse order due to foreign keys)
echo "Dropping existing tables..."
run_mysql "SET FOREIGN_KEY_CHECKS = 0;"
run_mysql "DROP TABLE IF EXISTS certificates;"
run_mysql "DROP TABLE IF EXISTS events;"
run_mysql "DROP TABLE IF EXISTS categories;"
run_mysql "SET FOREIGN_KEY_CHECKS = 1;"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Existing tables dropped${NC}"
else
    echo -e "${RED}❌ Failed to drop tables${NC}"
    exit 1
fi

# Create categories table with integer ID
echo "Creating categories table..."
run_mysql "
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Categories table created${NC}"
else
    echo -e "${RED}❌ Failed to create categories table${NC}"
    exit 1
fi

# Create events table with integer ID
echo "Creating events table..."
run_mysql "
CREATE TABLE events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    eventDate DATE NOT NULL,
    location VARCHAR(255),
    categoryId INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES categories(category_id)
);"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Events table created${NC}"
else
    echo -e "${RED}❌ Failed to create events table${NC}"
    exit 1
fi

# Create certificates table with integer eventId
echo "Creating certificates table..."
run_mysql "
CREATE TABLE certificates (
    cert_id VARCHAR(36) PRIMARY KEY,
    recipientName VARCHAR(255) NOT NULL,
    recipientEmail VARCHAR(255) NOT NULL,
    certificateNumber VARCHAR(255) NOT NULL UNIQUE,
    issueDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    templatePath VARCHAR(255) NOT NULL,
    certificatePath VARCHAR(255) NOT NULL,
    certificateUrl VARCHAR(255),
    verificationUrl VARCHAR(255) NOT NULL,
    isVerified BOOLEAN DEFAULT FALSE,
    emailSent BOOLEAN DEFAULT FALSE,
    additionalFields JSON,
    eventId INT NOT NULL,
    issuedTo VARCHAR(36),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (eventId) REFERENCES events(event_id)
);"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certificates table created${NC}"
else
    echo -e "${RED}❌ Failed to create certificates table${NC}"
    exit 1
fi

# Insert test data
echo "Inserting test data..."

# Insert test category
run_mysql "INSERT INTO categories (name, description) VALUES ('Programming Contest', 'Category for programming competitions');"

# Insert test event
run_mysql "INSERT INTO events (name, description, eventDate, location, categoryId) VALUES ('Test Programming Contest 2025', 'Test event for certificate generation', '2025-08-04', 'Online', 1);"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Test data inserted${NC}"
else
    echo -e "${RED}❌ Failed to insert test data${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Migration completed successfully!${NC}"
echo ""
echo "Database structure:"
echo "- Categories: Integer ID (auto-increment)"
echo "- Events: Integer ID (auto-increment)"  
echo "- Certificates: UUID cert_id, Integer eventId"
echo ""
echo "Test data created:"
echo "- Category ID: 1 (Programming Contest)"
echo "- Event ID: 1 (Test Programming Contest 2025)"
echo ""
echo "You can now test certificate generation with eventId: 1"
