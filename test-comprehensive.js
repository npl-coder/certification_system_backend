const { generateCertificate } = require('./utils/certificateGenerator');
const path = require('path');
const fs = require('fs');

// Test with different scenarios
async function testCertificateGeneration() {
  console.log('=== Testing Certificate Generation ===\n');
  
  const testCases = [
    {
      name: 'Test with mapping file',
      data: {
        recipientName: "John Doe",
        eventName: "Programming Contest 2025",
        eventDate: "2025-08-04",
        templatePath: path.join(__dirname, "../test-data/Certificate.png"),
        certificateNumber: "TEST-MAPPING-001",
        mappingPath: path.join(__dirname, "../test-data/mapping.json"),
        position: "Winner",
        organization: "ABC University", 
        score: "95"
      }
    },
    {
      name: 'Test without mapping file',
      data: {
        recipientName: "Jane Smith",
        eventName: "Programming Contest 2025",
        eventDate: "2025-08-04",
        templatePath: path.join(__dirname, "../test-data/Certificate.png"),
        certificateNumber: "TEST-NO-MAPPING-002"
      }
    },
    {
      name: 'Test with invalid mapping file',
      data: {
        recipientName: "Bob Johnson",
        eventName: "Programming Contest 2025", 
        eventDate: "2025-08-04",
        templatePath: path.join(__dirname, "../test-data/Certificate.png"),
        certificateNumber: "TEST-INVALID-MAPPING-003",
        mappingPath: "/non/existent/path.json"
      }
    },
    {
      name: 'Test with special characters',
      data: {
        recipientName: "José María Ñoño & Associates",
        eventName: "Contest <2025> \"Winners\"",
        eventDate: "2025-08-04",
        templatePath: path.join(__dirname, "../test-data/Certificate.png"),
        certificateNumber: "TEST-SPECIAL-CHARS-004",
        mappingPath: path.join(__dirname, "../test-data/mapping.json"),
        position: "1st Place",
        organization: "University & College",
        score: "100"
      }
    }
  ];

  const results = [];
  
  for (const testCase of testCases) {
    console.log(`\n--- ${testCase.name} ---`);
    
    try {
      // Check if required files exist
      if (!fs.existsSync(testCase.data.templatePath)) {
        console.error(`❌ Template file not found: ${testCase.data.templatePath}`);
        continue;
      }
      
      if (testCase.data.mappingPath && !testCase.data.mappingPath.includes('/non/existent/') && !fs.existsSync(testCase.data.mappingPath)) {
        console.error(`❌ Mapping file not found: ${testCase.data.mappingPath}`);
        continue;
      }
      
      console.log('✅ Starting generation...');
      const startTime = Date.now();
      
      const result = await generateCertificate(testCase.data);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Check if file was actually created and has content
      if (fs.existsSync(result.filePath)) {
        const stats = fs.statSync(result.filePath);
        console.log(`✅ Certificate generated successfully in ${duration}ms`);
        console.log(`   File: ${result.filePath}`);
        console.log(`   Size: ${stats.size} bytes`);
        console.log(`   URL: ${result.url}`);
        
        results.push({
          test: testCase.name,
          success: true,
          duration,
          fileSize: stats.size,
          result
        });
      } else {
        console.error(`❌ Certificate file was not created: ${result.filePath}`);
        results.push({
          test: testCase.name,
          success: false,
          error: 'File not created'
        });
      }
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      console.error(`   Stack: ${error.stack}`);
      
      results.push({
        test: testCase.name,
        success: false,
        error: error.message
      });
    }
  }
  
  console.log('\n=== Test Summary ===');
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`${successful}/${total} tests passed`);
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.test}: ${result.success ? `${result.duration}ms, ${result.fileSize} bytes` : result.error}`);
  });
  
  return results;
}

// Run the test if this file is executed directly
if (require.main === module) {
  testCertificateGeneration()
    .then(results => {
      console.log('\nTest completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { testCertificateGeneration };
