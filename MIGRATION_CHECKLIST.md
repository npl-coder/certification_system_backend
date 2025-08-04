# Migration Checklist: UUID to Integer IDs

## ✅ Completed Changes

### Backend Code Updates
- [x] **Event Model**: Changed `event_id` from UUID to INTEGER with auto-increment
- [x] **Category Model**: Changed `category_id` from UUID to INTEGER with auto-increment  
- [x] **Certificate Model**: Updated `eventId` foreign key from UUID to INTEGER
- [x] **Controller Validation**: Updated eventId validation from UUID regex to integer parsing
- [x] **Error Messages**: Updated to reflect integer format requirements
- [x] **Test Files**: Updated all test scenarios for integer validation
- [x] **Debug Tools**: Updated database helpers to work with integers

### Migration Tools Created
- [x] **Migration Script**: `scripts/migrate-to-integer-ids.sh` (ready to run)
- [x] **Validation Tests**: Integer parsing and validation tests
- [x] **Documentation**: Complete migration guide with examples

## 🔄 Next Steps

### 1. Database Migration
```bash
# IMPORTANT: Backup your database first!
mysqldump -u username -p certification_system > backup_$(date +%Y%m%d_%H%M%S).sql

# Run the migration
cd certification_system_backend
./scripts/migrate-to-integer-ids.sh
```

### 2. Verify Migration
```bash
# Check database state
node debug-db.js

# Test integer validation
node test-integer-validation.js

# Test API scenarios  
node test-scenarios.js
```

### 3. Frontend Updates Required
Update your frontend to send integer eventId instead of UUID:

**Before (UUID):**
```javascript
const formData = new FormData();
formData.append('eventId', 'f47ac10b-58cc-4372-a567-0e02b2c3d479');
```

**After (Integer):**
```javascript
const formData = new FormData();
formData.append('eventId', '1'); // or just 1
```

### 4. API Testing
After migration, test these scenarios:

| Test Case | eventId | Expected Result |
|-----------|---------|----------------|
| Valid integer | `1` | ✅ Success (if event exists) |
| String number | `"1"` | ✅ Success (parsed to integer) |
| Invalid string | `"abc"` | ❌ 400 - Invalid format |
| Negative number | `-1` | ❌ 400 - Invalid format |
| Zero | `0` | ❌ 400 - Invalid format |
| Non-existent | `9999` | ❌ 404 - Event not found |
| Missing | `null` | ❌ 400 - Required field |

## 🎯 Expected Results

### Before Migration (UUID)
```json
{
  "eventId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

### After Migration (Integer)
```json
{
  "eventId": 1
}
```

### New Error Messages
```json
{
  "success": false,
  "message": "Invalid event ID format. Expected positive integer."
}
```

## 🚨 Important Notes

1. **Data Loss**: The migration script will DROP all existing tables and recreate them
2. **Foreign Keys**: All relationships will be maintained with new integer IDs
3. **Certificates**: Still use UUID for `cert_id` (for security)
4. **Users**: Still use UUID for `user_id` (no change)
5. **Test Data**: Migration includes sample category and event for testing

## 🔧 Troubleshooting

### If migration fails:
1. Check database credentials in `.env`
2. Ensure MySQL is running
3. Check file permissions on migration script
4. Restore from backup if needed

### If API still fails after migration:
1. Check server logs for detailed errors
2. Verify event exists: `node debug-db.js`
3. Test integer validation: `node test-integer-validation.js`
4. Ensure frontend sends integer eventId

## 📋 Final Verification

Run this complete test sequence after migration:

```bash
# 1. Check database
node debug-db.js

# 2. Test validation
node test-integer-validation.js  

# 3. Test API scenarios
node test-scenarios.js

# 4. Test certificate generation (if server running)
node test-api-complete.js
```

Expected output should show:
- ✅ Event ID: 1 exists in database
- ✅ Integer validation working correctly
- ✅ API accepting integer eventId values
- ✅ Certificate generation working with mapping files

The migration is now ready to run! The frontend issue should be resolved once the database uses integer IDs and the frontend is updated to send integer eventId values.
