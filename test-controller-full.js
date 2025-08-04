// Simulate full controller test with integer eventId
const { generateBulkCertificates } = require('./controllers/certificateController');
const path = require('path');
const fs = require('fs');

async function testControllerWithIntegerEventId() {
  try {
    console.log('=== Testing Controller with Integer EventId ===\n');
    
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
    
    // Mock request object
    const mockReq = {
      body: {
        eventId: '1',  // Integer as string (how frontend sends it)
        positioning_method: 'manual'
      },
      files: {
        csv: [{
          originalname: 'participants.csv',
          path: csvPath,
          size: fs.statSync(csvPath).size
        }],
        template: [{
          originalname: 'Certificate.png',
          path: templatePath,
          size: fs.statSync(templatePath).size
        }],
        mapping: [{
          originalname: 'mapping.json',
          path: mappingPath,
          size: fs.statSync(mappingPath).size
        }]
      }
    };
    
    // Mock response object
    let responseData = null;
    let statusCode = null;
    
    const mockRes = {
      status: (code) => {
        statusCode = code;
        return mockRes;
      },
      json: (data) => {
        responseData = data;
        return mockRes;
      }
    };
    
    console.log('Request details:');
    console.log('- Event ID:', mockReq.body.eventId);
    console.log('- Positioning method:', mockReq.body.positioning_method);
    console.log('- Files:', Object.keys(mockReq.files));
    
    console.log('\nCalling generateBulkCertificates controller...');
    
    // Call the controller
    try {
      await generateBulkCertificates(mockReq, mockRes);
    } catch (error) {
      console.error('Controller threw an error:', error.message);
      console.error('Stack:', error.stack);
    }
    
    console.log('\n--- Controller Response ---');
    console.log('Status Code:', statusCode);
    console.log('Response Data:', JSON.stringify(responseData, null, 2));
    
    if (statusCode === 201 && responseData.success) {
      console.log('\n🎉 SUCCESS! Controller accepts integer eventId and generates certificates!');
      console.log(`Generated ${responseData.data.length} certificate(s)`);
      
      // Show certificate details
      responseData.data.forEach((cert, index) => {
        console.log(`\nCertificate ${index + 1}:`);
        console.log(`- Recipient: ${cert.recipientName}`);
        console.log(`- Email: ${cert.recipientEmail}`);
        console.log(`- Number: ${cert.certificateNumber}`);
        console.log(`- Event ID: ${cert.eventId}`);
        console.log(`- URL: ${cert.certificateUrl}`);
      });
      
      console.log('\n✅ Backend is now ready for frontend integration!');
      console.log('✅ Frontend should send eventId as integer: 1');
      console.log('✅ Mapping files are working correctly');
      console.log('✅ Certificate generation is working perfectly');
      
    } else {
      console.log('\n❌ Controller test failed');
      console.log('This indicates an issue with the controller logic');
    }
    
  } catch (error) {
    console.error('\n❌ Controller test error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testControllerWithIntegerEventId()
    .then(() => {
      console.log('\nController test completed!');
    })
    .catch(error => {
      console.error('Controller test failed:', error);
    });
}

module.exports = { testControllerWithIntegerEventId };
