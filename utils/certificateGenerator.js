const sharp = require('sharp');
const path = require('path');
const fs = require('fs-extra');

// Generate certificate from template
const generateCertificate = async (data) => {
  try {
    const {
      recipientName,
      eventName,
      eventDate,
      templatePath,
      certificateNumber,
      ...additionalFields
    } = data;

    // Ensure certificate directory exists
    const certDir = path.join(__dirname, '../uploads/certificates');
    await fs.ensureDir(certDir);

    // Generate output filename
    const outputFilename = `cert-${certificateNumber}.png`;
    const outputPath = path.join(certDir, outputFilename);

    // Load template
    const templateBuffer = await fs.readFile(templatePath);
    
    // Format date
    const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create SVG overlay with text (simplified version)
    const svgText = `
      <svg width="800" height="600">
        <style>
          .recipient { fill: #333; font-size: 48px; font-weight: bold; font-family: Arial, sans-serif; }
          .event { fill: #666; font-size: 36px; font-family: Arial, sans-serif; }
          .certnum { fill: #666; font-size: 18px; font-family: Arial, sans-serif; }
          .date { fill: #666; font-size: 24px; font-family: Arial, sans-serif; }
        </style>
        <text x="400" y="250" text-anchor="middle" class="recipient">${recipientName}</text>
        <text x="400" y="320" text-anchor="middle" class="event">${eventName}</text>
        <text x="400" y="370" text-anchor="middle" class="date">${formattedDate}</text>
        <text x="400" y="520" text-anchor="middle" class="certnum">Certificate #${certificateNumber}</text>
      </svg>
    `;

    // Process image with text overlay
    await sharp(templateBuffer)
      .composite([
        {
          input: Buffer.from(svgText),
          top: 0,
          left: 0
        }
      ])
      .png()
      .toFile(outputPath);

    console.log(`Certificate generated: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
};

module.exports = { generateCertificate };