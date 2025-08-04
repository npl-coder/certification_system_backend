const { generateCertificate } = require('./utils/certificateGenerator');
const path = require('path');
const fs = require('fs');

// Test the mapping functionality
async function testMappingGeneration() {
  try {
    // Test data
    const testData = {
      recipientName: "John Doe",
      eventName: "Programming Contest 2025", 
      eventDate: "2025-08-04",
      templatePath: path.join(__dirname, "../test-data/Certificate.png"),
      certificateNumber: "TEST-001",
      mappingPath: path.join(__dirname, "../test-data/mapping.json"),
      // Additional fields from CSV
      position: "Winner",
      organization: "ABC University",
      score: "95"
    };

    console.log('Testing certificate generation with mapping...');
    console.log('Template path:', testData.templatePath);
    console.log('Mapping path:', testData.mappingPath);
    
    // Check if files exist
    if (!fs.existsSync(testData.templatePath)) {
      console.error('Template file not found:', testData.templatePath);
      return;
    }
    
    if (!fs.existsSync(testData.mappingPath)) {
      console.error('Mapping file not found:', testData.mappingPath);
      return;
    }

    const result = await generateCertificate(testData);
    console.log('Certificate generation successful!');
    console.log('Result:', result);
    
    // Test without mapping
    console.log('\nTesting certificate generation without mapping...');
    const testDataNoMapping = { ...testData };
    delete testDataNoMapping.mappingPath;
    
    const resultNoMapping = await generateCertificate(testDataNoMapping);
    console.log('Certificate generation without mapping successful!');
    console.log('Result:', resultNoMapping);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testMappingGeneration();
}

module.exports = { testMappingGeneration };
