const fs = require('fs');
const path = require('path');

// Create a test CSV file if it doesn't exist
const createTestCSV = () => {
  const csvPath = path.join(__dirname, '../test-data/participants.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log('Creating test CSV file...');
    const csvContent = `name,email,position,organization,score
John Doe,john@example.com,Winner,ABC University,95
Jane Smith,jane@example.com,Runner-up,XYZ College,92
Bob Johnson,bob@example.com,Participant,DEF Institute,85`;
    
    fs.writeFileSync(csvPath, csvContent);
    console.log('Test CSV created at:', csvPath);
  }
  
  return csvPath;
};

// Test the controller logic directly
const testControllerLogic = async () => {
  console.log('=== Testing Controller Logic ===\n');
  
  // Mock the request object that the controller would receive
  const csvPath = createTestCSV();
  const templatePath = path.join(__dirname, '../test-data/Certificate.png');
  const mappingPath = path.join(__dirname, '../test-data/mapping.json');
  
  console.log('File paths:');
  console.log('CSV:', csvPath, 'exists:', fs.existsSync(csvPath));
  console.log('Template:', templatePath, 'exists:', fs.existsSync(templatePath));
  console.log('Mapping:', mappingPath, 'exists:', fs.existsSync(mappingPath));
  
  const mockReq = {
    body: {
      eventId: '1',
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

  console.log('\n--- Simulating Controller Processing ---');
  
  try {
    // Simulate the CSV parsing logic
    const csvParser = require('csv-parser');
    const results = [];
    
    console.log('Reading CSV file...');
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csvParser())
        .on('data', (data) => {
          console.log('CSV row:', data);
          results.push(data);
        })
        .on('end', () => {
          console.log(`Parsed ${results.length} rows from CSV`);
          resolve();
        })
        .on('error', reject);
    });
    
    // Check if we can load the mapping file
    console.log('\nTesting mapping file...');
    try {
      const mappingContent = fs.readFileSync(mappingPath, 'utf8');
      const mapping = JSON.parse(mappingContent);
      console.log('Mapping file loaded successfully');
      console.log('Fields in mapping:', Object.keys(mapping.fields || {}));
    } catch (mappingError) {
      console.error('Error loading mapping:', mappingError.message);
    }
    
    // Simulate certificate generation for one row
    console.log('\nTesting certificate generation for first row...');
    if (results.length > 0) {
      const { generateCertificate } = require('./utils/certificateGenerator');
      
      const testRow = results[0];
      const certificateNumber = `TEST-API-${Date.now()}`;
      
      const certificateResult = await generateCertificate({
        recipientName: testRow.name || testRow.recipientName,
        eventName: 'Test Event', // Mock event name since we don't have DB access
        eventDate: '2025-08-04',
        templatePath: templatePath,
        certificateNumber: certificateNumber,
        mappingPath: mappingPath,
        ...testRow
      });
      
      console.log('✅ Certificate generated successfully:', certificateResult);
      
      // Verify file exists and has content
      if (fs.existsSync(certificateResult.filePath)) {
        const stats = fs.statSync(certificateResult.filePath);
        console.log(`✅ File verified: ${stats.size} bytes`);
      } else {
        console.error('❌ Certificate file not found');
      }
    }
    
    console.log('\n✅ Controller logic simulation completed successfully');
    
  } catch (error) {
    console.error('❌ Controller logic simulation failed:', error);
    console.error('Stack:', error.stack);
  }
};

// Run the test
if (require.main === module) {
  testControllerLogic()
    .then(() => {
      console.log('\nTest completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testControllerLogic, createTestCSV };
