# Development Guide - Test User Credentials

## Overview
This guide explains the best practices for handling test user credentials in the NPL Coder Certification System during development.

## 🚀 Quick Start

### 1. Setup Database with Test Data
```bash
# Reset database and seed with test data
npm run reset:dev

# Or run individually
npm run setup:db  # Creates database tables
npm run seed:dev  # Adds test users and sample data
```

### 2. Available Test Credentials

| Role  | Email                | Password   | Purpose                    |
|-------|---------------------|------------|----------------------------|
| Admin | admin@nplcoder.com  | admin123   | Full system access         |
| User  | user@nplcoder.com   | user123    | Regular user testing       |
| Dev   | dev@nplcoder.com    | dev123     | Development testing        |
| Test  | john.doe@example.com| password123| Sample certificate holder  |

### 3. Environment Variables
The following test credentials are available in your `.env` file:

```env
# Development Test Credentials (DO NOT USE IN PRODUCTION)
DEV_ADMIN_EMAIL=admin@nplcoder.com
DEV_ADMIN_PASSWORD=admin123
DEV_USER_EMAIL=user@nplcoder.com  
DEV_USER_PASSWORD=user123
```

## 🔧 Best Practices

### ✅ DO
- **Use the seeder script** for consistent test data
- **Keep test credentials in .env for development only**
- **Use different passwords for different environments**
- **Include test data generation in your setup process**
- **Document all test credentials clearly**

### ❌ DON'T
- **Never commit real user credentials to version control**
- **Never use production credentials in development**
- **Don't hardcode credentials in frontend code**
- **Don't use weak passwords even for testing**

## 📁 File Structure

```
scripts/
├── seed-dev-data.js     # Database seeder with test users
├── setup-db.sh         # Database setup script
└── setup.sh            # Full project setup

config/
├── database.js          # Database configuration
└── .env                 # Environment variables (includes test creds)

.env.sample              # Template for environment variables
```

## 🛠 Usage in Frontend (test.html)

The test interface is pre-configured with test credentials:

```html
<!-- Admin Login (default) -->
<input id="loginEmail" value="admin@nplcoder.com" />
<input id="loginPassword" value="admin123" />

<!-- User Registration -->
<input id="registerEmail" value="test@example.com" />
<input id="registerPassword" value="password123" />
```

## 🔄 Resetting Test Data

### Complete Reset
```bash
npm run reset:dev
```

### Just Seed Data
```bash
npm run seed:dev
```

### Manual Database Reset
```bash
npm run setup:db
```

## 🧪 Testing API Endpoints

### Authentication
```bash
# Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nplcoder.com","password":"admin123"}'

# Login as user  
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@nplcoder.com","password":"user123"}'
```

### Using the Test Interface
1. Open `test.html` in your browser
2. Default admin credentials are pre-filled
3. Click "Test Connection" to verify server is running
4. Click "Login" to authenticate
5. Use other API buttons to test functionality

## 🔒 Security Notes

### Development Environment
- Test credentials are stored in `.env` file
- Database seeder creates consistent test data
- Passwords are properly hashed in database
- Test users have appropriate role assignments

### Production Environment
- **Never use these test credentials**
- Remove or change all default passwords
- Use strong, unique credentials
- Implement proper user registration flow
- Use environment-specific configuration

## 📊 Sample Data Included

The seeder creates:

### Users
- 1 Admin user (full access)
- 3 Regular users (certificate recipients)

### Categories
- Web Development
- Data Science  
- Mobile Development

### Events
- React.js Bootcamp 2025
- Python Data Analysis Workshop

## 🚨 Environment Detection

The seeder includes safety checks:

```javascript
// Prevents running in production
if (process.env.NODE_ENV === "production") {
  console.error("❌ This seeder should NOT be run in production!");
  process.exit(1);
}
```

## 📝 Maintenance

### Updating Test Data
1. Edit `scripts/seed-dev-data.js`
2. Modify the `DEV_USERS`, `DEV_CATEGORIES`, or `DEV_EVENTS` arrays
3. Run `npm run seed:dev` to apply changes

### Adding New Test Users
```javascript
// In scripts/seed-dev-data.js
const DEV_USERS = [
  // ... existing users
  {
    name: "New Test User",
    email: "newuser@example.com",
    password: "testpass123",
    role: "user"
  }
];
```

### Environment Variables
Update `.env` file as needed, but never commit sensitive data.

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Check database status
npm run test:db

# Reset database
npm run setup:db
```

### Seeder Issues
```bash
# Run seeder with debug output
NODE_ENV=development node scripts/seed-dev-data.js
```

### Authentication Issues
- Verify JWT_SECRET is set in .env
- Check password hashing in User model
- Confirm user exists in database

---

**Remember**: These credentials are for development only. Always use secure, unique credentials in production environments.
