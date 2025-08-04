const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test the actual API endpoint
async function testActualAPI() {
  console.log('=== Testing Actual API Endpoint ===\n');
  
  const apiUrl = 'http://localhost:3000/api/certificates/admin/generate';
  
  try {
    // Check if server is running
    const axios = require('axios');
    
    try {
      const healthCheck = await axios.get('http://localhost:3000/health', { timeout: 5000 });
      console.log('✅ Server is running');
    } catch (serverError) {
      console.log('❌ Server not running or not responding');
      console.log('💡 Please start the server with: npm start or node app.js');
      return;
    }
    
    // First check what events exist
    console.log('\n--- Checking Database State ---');
    const { checkDatabaseState } = require('./debug-db');
    const dbState = await checkDatabaseState();
    
    if (dbState.events.length === 0) {
      console.log('❌ No events in database - creating test event...');
      const { createTestEvent } = require('./debug-db');
      const testEvent = await createTestEvent();
      dbState.events.push({
        id: testEvent.event_id,
        name: testEvent.name,
        date: testEvent.eventDate
      });
    }
    
    // Use the first available event
    const testEvent = dbState.events[0];
    console.log(`✅ Using event: ${testEvent.name} (${testEvent.id})`);
    
    // Prepare test files
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
    
    // Create form data
    console.log('\n--- Making API Request ---');
    const formData = new FormData();
    formData.append('csv', fs.createReadStream(csvPath));
    formData.append('template', fs.createReadStream(templatePath));
    formData.append('mapping', fs.createReadStream(mappingPath));
    formData.append('eventId', testEvent.id.toString());
    formData.append('positioning_method', 'manual');
    
    console.log('Request details:');
    console.log(`  URL: ${apiUrl}`);
    console.log(`  Event ID: ${testEvent.id}`);
    console.log(`  Positioning: manual`);
    console.log(`  Files: CSV, Template, Mapping`);
    
    // Note: You'll need to add authentication headers here
    console.log('\n⚠️  Note: This test requires admin authentication');
    console.log('💡 Add authentication headers to complete the test');
    
    // Uncomment and modify this when you have auth token:
    /*
    const response = await axios.post(apiUrl, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE'
      },
      timeout: 60000
    });
    
    console.log('✅ API Response:', response.data);
    */
    
  } catch (error) {
    console.error('❌ API Test Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Simple health check
async function quickHealthCheck() {
  try {
    const axios = require('axios');
    const response = await axios.get('http://localhost:3000/health', { timeout: 5000 });
    console.log('✅ Server health check passed');
    return true;
  } catch (error) {
    console.log('❌ Server health check failed');
    console.log('💡 Start the server with: npm start');
    return false;
  }
}

// Run tests
if (require.main === module) {
  console.log('Certificate Generation API Test Suite\n');
  
  quickHealthCheck()
    .then(healthy => {
      if (healthy) {
        return testActualAPI();
      } else {
        console.log('\nPlease start the server and try again.');
      }
    })
    .then(() => {
      console.log('\nTest completed!');
    })
    .catch(error => {
      console.error('Test suite failed:', error);
    });
}

module.exports = { testActualAPI, quickHealthCheck };
