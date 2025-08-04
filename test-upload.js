const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

// Create a simple test CSV file
const csvContent = 'name,email\nJohn Doe,john@example.com\nJane Smith,jane@example.com';
fs.writeFileSync('./test.csv', csvContent);

// Create a simple test image (1x1 pixel PNG)
const pngBuffer = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
  0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
  0x01, 0x00, 0x01, 0x8D, 0xB4, 0x2C, 0x7A, 0x00, 0x00, 0x00, 0x00, 0x49,
  0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
]);
fs.writeFileSync('./test.png', pngBuffer);

async function testUpload() {
  try {
    const form = new FormData();
    form.append('eventId', '1');
    form.append('csv', fs.createReadStream('./test.csv'));
    form.append('template', fs.createReadStream('./test.png'));

    const response = await axios.post(
      'http://localhost:3000/api/certificates/admin/generate',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': 'Bearer fake-token' // This will fail auth but test the upload
        },
        timeout: 30000 // 30 second timeout
      }
    );

    console.log('Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Server responded with:', error.response.status, error.response.data);
    } else if (error.request) {
      console.log('Network error:', error.message);
    } else {
      console.log('Error:', error.message);
    }
  } finally {
    // Clean up test files
    try {
      fs.unlinkSync('./test.csv');
      fs.unlinkSync('./test.png');
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

testUpload();
