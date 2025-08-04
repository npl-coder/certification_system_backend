const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testBulkGenerationAPI() {
  try {
    const apiUrl = 'http://localhost:3000/api/certificates/admin/generate';
    
    // Create form data
    const formData = new FormData();
    
    // Add CSV file
    const csvPath = path.join(__dirname, '../test-data/participants.csv');
    const templatePath = path.join(__dirname, '../test-data/Certificate.png');
    const mappingPath = path.join(__dirname, '../test-data/mapping.json');
    
    console.log('Testing paths:');
    console.log('CSV:', csvPath, 'exists:', fs.existsSync(csvPath));
    console.log('Template:', templatePath, 'exists:', fs.existsSync(templatePath));
    console.log('Mapping:', mappingPath, 'exists:', fs.existsSync(mappingPath));
    
    if (!fs.existsSync(csvPath)) {
      console.error('CSV file not found. Creating a sample...');
      const sampleCSV = 'name,email,position,organization,score\nJohn Doe,john@example.com,Winner,ABC University,95\nJane Smith,jane@example.com,Runner-up,XYZ College,92';
      fs.writeFileSync(csvPath, sampleCSV);
    }
    
    formData.append('csv', fs.createReadStream(csvPath));
    formData.append('template', fs.createReadStream(templatePath));
    formData.append('mapping', fs.createReadStream(mappingPath));
    formData.append('eventId', '1'); // Assuming event ID 1 exists
    formData.append('positioning_method', 'manual');
    
    console.log('Making API request...');
    
    const response = await axios.post(apiUrl, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Bearer your-admin-token-here' // You'll need to replace this
      },
      timeout: 60000
    });
    
    console.log('API Response:', response.data);
    
  } catch (error) {
    console.error('API Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testBulkGenerationAPI();
}

module.exports = { testBulkGenerationAPI };
