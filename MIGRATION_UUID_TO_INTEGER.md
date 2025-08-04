# Database Schema Migration: UUID to Integer IDs

## Overview
This migration converts the database schema from using UUID primary keys to integer auto-increment primary keys for Events and Categories tables.

## Changes Made

### 1. Model Updates

#### Event Model (`models/event.js`)
- Changed `event_id` from `DataTypes.UUID` to `DataTypes.INTEGER` with `autoIncrement: true`
- Changed `categoryId` from `DataTypes.UUID` to `DataTypes.INTEGER`

#### Category Model (`models/category.js`)
- Changed `category_id` from `DataTypes.UUID` to `DataTypes.INTEGER` with `autoIncrement: true`

#### Certificate Model (`models/certificate.js`)
- Changed `eventId` from `DataTypes.UUID` to `DataTypes.INTEGER`
- Kept `cert_id` as UUID (certificates still use UUID)
- Kept `issuedTo` as UUID (users still use UUID)

### 2. Controller Updates

#### Certificate Controller (`controllers/certificateController.js`)
- Updated eventId validation from UUID regex to integer validation
- Added `parseInt()` conversion for eventId
- Added validation for positive integers
- Updated error messages to reflect integer format

### 3. Test Files Updated
- `test-scenarios.js` - Updated test cases for integer validation
- `debug-db.js` - Removed UUID generation for creating test events
- `test-api-complete.js` - Updated to use integer event IDs

### 4. Migration Script
- Created `scripts/migrate-to-integer-ids.sh` for database migration
- Drops existing tables and recreates with new schema
- Includes test data creation

## Database Schema (After Migration)

### Categories Table
```sql
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Events Table
```sql
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
);
```

### Certificates Table
```sql
CREATE TABLE certificates (
    cert_id VARCHAR(36) PRIMARY KEY,           -- Still UUID
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
    eventId INT NOT NULL,                       -- Now INTEGER
    issuedTo VARCHAR(36),                       -- Still UUID
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (eventId) REFERENCES events(event_id),
    FOREIGN KEY (issuedTo) REFERENCES users(user_id)
);
```

## Migration Steps

### 1. Backup Your Data (IMPORTANT!)
```bash
# Create a backup before migration
mysqldump -u username -p certification_system > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Run Migration
```bash
cd certification_system_backend
./scripts/migrate-to-integer-ids.sh
```

### 3. Verify Migration
```bash
# Check database state
node debug-db.js

# Test certificate generation
node test-scenarios.js
```

### 4. Update Frontend
Ensure your frontend sends integer eventId values instead of UUIDs:

**Before:**
```javascript
{
  eventId: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

**After:**
```javascript
{
  eventId: 1  // or "1" as string
}
```

## API Changes

### Request Format
The certificate generation API now expects integer eventId:

```bash
curl -X POST http://localhost:3000/api/certificates/admin/generate \
  -F "csv=@participants.csv" \
  -F "template=@certificate_template.png" \
  -F "mapping=@mapping.json" \
  -F "eventId=1" \
  -H "Authorization: Bearer your-token"
```

### Error Responses
New validation errors for integer format:

```json
{
  "success": false,
  "message": "Invalid event ID format. Expected positive integer."
}
```

## Benefits of Integer IDs

1. **Simpler URLs**: `/events/1` instead of `/events/f47ac10b-58cc-4372-a567-0e02b2c3d479`
2. **Better Performance**: Integer joins are faster than UUID joins
3. **Smaller Storage**: 4 bytes vs 36 bytes for UUIDs
4. **Easier Testing**: Simple incremental IDs for testing
5. **Frontend Friendly**: Easier to work with in forms and APIs

## Testing

After migration, test the following scenarios:

1. **Valid Integer EventId**: `eventId: 1` → Should work
2. **Invalid String**: `eventId: "abc"` → Should return 400 error
3. **Negative Integer**: `eventId: -1` → Should return 400 error
4. **Zero**: `eventId: 0` → Should return 400 error
5. **Non-existent ID**: `eventId: 9999` → Should return 404 error
6. **Missing ID**: `eventId: null` → Should return 400 error

## Rollback Plan

If you need to rollback:

1. Restore from backup:
   ```bash
   mysql -u username -p certification_system < backup_YYYYMMDD_HHMMSS.sql
   ```

2. Revert model files to use UUID
3. Revert controller validation to UUID regex

## Notes

- User IDs remain as UUIDs (no change needed)
- Certificate IDs remain as UUIDs (for security)
- Only Event and Category IDs changed to integers
- All foreign key relationships updated accordingly
- Migration script includes test data for immediate testing
