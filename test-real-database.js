// Test certificate generation with real database
const { generateCertificate } = require('./utils/certificateGenerator');
const { Event } = require('./models');
const path = require('path');
const fs = require('fs');

async function testWithRealDatabase() {
  try {
    console.log('=== Testing Certificate Generation with Real Database ===\n');
    
    // Test database connection
    const { sequelize } = require('./models');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Get real event from database
    const event = await Event.findByPk(1);
    if (!event) {
      console.error('❌ Event with ID 1 not found');
      return;
    }
    
    console.log('✅ Event found:', {
      id: event.event_id,
      name: event.name,
      date: event.eventDate
    });
    
    // Test files
    const csvPath = path.join(__dirname, '../test-data/participants.csv');
    const templatePath = path.join(__dirname, '../test-data/Certificate.png');
    const mappingPath = path.join(__dirname, '../test-data/mapping.json');
    
    // Create test CSV if it doesn't exist
    if (!fs.existsSync(csvPath)) {
      const csvContent = 'name,email,position,organization,score\nJohn Doe,john@example.com,Winner,ABC University,95\nJane Smith,jane@example.com,Runner-up,XYZ College,92';
      fs.writeFileSync(csvPath, csvContent);
      console.log('✅ Created test CSV file');
    }
    
    // Check all files exist
    const files = [
      { name: 'CSV', path: csvPath },
      { name: 'Template', path: templatePath },
      { name: 'Mapping', path: mappingPath }
    ];
    
    console.log('\n--- File Check ---');
    for (const file of files) {
      if (fs.existsSync(file.path)) {
        const stats = fs.statSync(file.path);
        console.log(`✅ ${file.name}: ${stats.size} bytes`);
      } else {
        console.log(`❌ ${file.name}: Not found at ${file.path}`);
        return;
      }
    }
    
    // Test certificate generation
    console.log('\n--- Testing Certificate Generation ---');
    const certificateData = {
      recipientName: "Test User",
      eventName: event.name,
      eventDate: event.eventDate,
      templatePath: templatePath,
      certificateNumber: `TEST-REAL-${Date.now()}`,
      mappingPath: mappingPath,
      position: "Winner",
      organization: "Test University",
      score: "95"
    };
    
    console.log('Generating certificate with data:', {
      recipientName: certificateData.recipientName,
      eventName: certificateData.eventName,
      eventDate: certificateData.eventDate,
      certificateNumber: certificateData.certificateNumber,
      hasMapping: !!certificateData.mappingPath
    });
    
    const result = await generateCertificate(certificateData);
    
    console.log('✅ Certificate generated successfully!');
    console.log('Result:', result);
    
    // Verify file exists and has content
    if (fs.existsSync(result.filePath)) {
      const stats = fs.statSync(result.filePath);
      console.log(`✅ Certificate file verified: ${stats.size} bytes`);
      
      if (stats.size > 0) {
        console.log('🎉 Certificate generation with integer eventId works perfectly!');
        console.log('\nNext steps:');
        console.log('1. ✅ Database migrated to integer IDs');
        console.log('2. ✅ Certificate generation works with mapping files');
        console.log('3. 🔄 Update frontend to use eventId: 1 instead of UUID');
        console.log('4. 🔄 Test frontend API calls with eventId: 1');
      } else {
        console.error('❌ Certificate file is empty');
      }
    } else {
      console.error('❌ Certificate file not found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testWithRealDatabase()
    .then(() => {
      console.log('\nTest completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testWithRealDatabase };
