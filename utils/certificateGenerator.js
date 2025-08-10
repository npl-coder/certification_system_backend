const sharp = require('sharp');
const path = require('path');
const fs = require('fs-extra');

// Helper function to validate mapping file structure
const validateMapping = (mapping) => {
  if (!mapping || typeof mapping !== 'object') {
    return false;
  }
  
  if (!mapping.fields || typeof mapping.fields !== 'object') {
    return false;
  }
  
  // Validate each field has required properties
  for (const [fieldKey, field] of Object.entries(mapping.fields)) {
    if (!field || typeof field !== 'object') {
      console.warn(`Invalid field configuration for ${fieldKey}`);
      continue;
    }
    
    if (typeof field.x !== 'number' || typeof field.y !== 'number') {
      console.warn(`Invalid coordinates for field ${fieldKey}`);
      return false;
    }
  }
  
  return true;
};

// Helper function to escape XML/SVG special characters
const escapeXml = (text) => {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Helper function to get field value with fallback
const getFieldValue = (dataFields, fieldKey) => {
  // Try different variations of field names
  const variations = [
    fieldKey,
    fieldKey.toLowerCase(),
    fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1),
    // Add common aliases
    ...(fieldKey === 'name' ? ['recipientName', 'participant_name', 'full_name'] : []),
    ...(fieldKey === 'eventName' ? ['event_name', 'event', 'competition'] : []),
    ...(fieldKey === 'eventDate' ? ['event_date', 'date', 'competition_date'] : []),
    ...(fieldKey === 'certificateNumber' ? ['certificate_number', 'cert_number', 'certificate_id'] : []),
  ];
  
  for (const variation of variations) {
    if (dataFields[variation] !== undefined && dataFields[variation] !== null) {
      return dataFields[variation];
    }
  }
  
  return null;
};

// Generate certificate from template
const generateCertificate = async (data) => {
  try {
    const {
      recipientName,
      eventName,
      eventDate,
      templatePath,
      certificateNumber,
      mappingPath,
      ...additionalFields
    } = data;

    // Ensure certificate directory exists
    const certDir = path.join(__dirname, '../uploads/certificates');
    await fs.ensureDir(certDir);

    // Generate output filenames (full PNG + WebP preview)
    const outputFilename = `cert-${certificateNumber}.png`;
    const outputPath = path.join(certDir, outputFilename);
    const previewFilename = `cert-${certificateNumber}-preview.webp`;
    const previewPath = path.join(certDir, previewFilename);

    // Load template
    const templateBuffer = await fs.readFile(templatePath);
    const templateImage = sharp(templateBuffer);
    const templateMetadata = await templateImage.metadata();
    
    // Load mapping configuration if provided
    let mapping = null;
    if (mappingPath && await fs.pathExists(mappingPath)) {
      try {
        const mappingData = await fs.readFile(mappingPath, 'utf8');
        const parsedMapping = JSON.parse(mappingData);
        
        if (validateMapping(parsedMapping)) {
          mapping = parsedMapping;
          console.log('Successfully loaded and validated mapping file');
        } else {
          console.warn('Invalid mapping file structure, using default positioning');
        }
      } catch (error) {
        console.warn('Error parsing mapping file, using default positioning:', error.message);
      }
    }
    
    // Format date
    const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Prepare data fields for mapping
    const dataFields = {
      name: recipientName,
      eventName: eventName,
      eventDate: formattedDate,
      certificateNumber: certificateNumber,
      ...additionalFields
    };

    // Log available fields for debugging
    if (mapping) {
      console.log('Available data fields:', Object.keys(dataFields));
      console.log('Mapping expects fields:', Object.keys(mapping.fields));
    }

    // Create SVG overlay with text
    let svgText;
    
    if (mapping && mapping.fields) {
      // Use mapping configuration for positioning
      const templateWidth = templateMetadata.width || mapping.template?.width || 800;
      const templateHeight = templateMetadata.height || mapping.template?.height || 600;
      
      // Calculate scaling factor if mapping template size differs from actual template
      const scaleX = mapping.template?.width ? templateWidth / mapping.template.width : 1;
      const scaleY = mapping.template?.height ? templateHeight / mapping.template.height : 1;
      
      console.log('Template dimensions:', templateWidth, 'x', templateHeight);
      console.log('Mapping template dimensions:', mapping.template?.width || 'not specified', 'x', mapping.template?.height || 'not specified');
      console.log('Scale factors:', { scaleX, scaleY });
      
      svgText = `<svg width="${templateWidth}" height="${templateHeight}">`;
      
      // Add styles
      svgText += '<style>';
      Object.keys(mapping.fields).forEach(fieldKey => {
      const field = mapping.fields[fieldKey];
      const className = `field-${fieldKey}`;
      // Add font fallbacks for better compatibility
      let fontFamily;
      if (fieldKey === 'name') {
        // Use Amsterdam font for recipientName
        fontFamily = `'Amsterdam', ${field.fontFamily ? field.fontFamily + ',' : ''} Arial, sans-serif`;
      } else {
        fontFamily = field.fontFamily ? `${field.fontFamily}, Arial, sans-serif` : 'Arial, sans-serif';
      }
      
      svgText += `
        .${className} { 
        fill: ${field.color || '#333'}; 
        font-size: ${Math.round((field.fontSize || 61) * Math.min(scaleX, scaleY))}px; 
        font-weight: ${field.fontWeight || 'normal'}; 
        font-family: ${fontFamily}; 
        }`;
      });
      svgText += '</style>';
      
      // Add text elements based on mapping
      Object.keys(mapping.fields).forEach(fieldKey => {
      const field = mapping.fields[fieldKey];
      const value = getFieldValue(dataFields, fieldKey);
      
      if (value !== undefined && value !== null) {
        const className = `field-${fieldKey}`;
        const textValue = escapeXml(`${field.prefix || ''}${value}${field.suffix || ''}`);
        const textAnchor = field.textAlign === 'center' ? 'middle' : 
             field.textAlign === 'right' ? 'end' : 'start';
        
        // Apply scaling to coordinates and move text down by 100 in y
        const scaledX = Math.round(field.x * scaleX);
        const scaledY = Math.round(field.y * scaleY) + 100;
        
        svgText += `<text x="${scaledX}" y="${scaledY}" text-anchor="${textAnchor}" class="${className}">${textValue}</text>`;
      }
      });
      
      // Always add footer certificate number at the bottom center
      const footerFontSize = Math.round(18 * Math.min(scaleX, scaleY));
      const footerY = Math.max(footerFontSize + 6, Math.round(templateHeight - (24 * Math.min(scaleX, scaleY))));
      svgText += `
        <style>
          .footer-certnum { fill: #666; font-size: ${footerFontSize}px; font-family: Arial, sans-serif; }
        </style>
        <text x="${Math.round(templateWidth/2)}" y="${footerY}" text-anchor="middle" class="footer-certnum">Certificate #${escapeXml(certificateNumber)}</text>
      `;

      svgText += '</svg>';
    } else {
      // Fallback to default positioning
      const templateWidth = templateMetadata.width || 800;
      const templateHeight = templateMetadata.height || 600;
      
      svgText = `
      <svg width="${templateWidth}" height="${templateHeight}">
      <style>
      @font-face {
        font-family: 'Amsterdam';
        src: url('/fonts/Amsterdam.ttf') format('truetype');
      }
      .recipient { fill: #333; font-size: 61px; font-weight: bold; font-family: 'Amsterdam', Arial, sans-serif; }
      .event { fill: #666; font-size: 36px; font-family: Arial, sans-serif; }
      .certnum { fill: #666; font-size: 18px; font-family: Arial, sans-serif; }
      .date { fill: #666; font-size: 24px; font-family: Arial, sans-serif; }
      .footer-certnum { fill: #666; font-size: 18px; font-family: Arial, sans-serif; }
      </style>
      <text x="${templateWidth/2}" y="${templateHeight*0.42 + 200}" text-anchor="middle" class="recipient">${escapeXml(recipientName)}</text>
      <text x="${templateWidth/2}" y="${templateHeight*0.53 + 300}" text-anchor="middle" class="event">${escapeXml(eventName)}</text>
      <text x="${templateWidth/2}" y="${templateHeight*0.62 + 300}" text-anchor="middle" class="date">${escapeXml(formattedDate)}</text>
      <text x="${templateWidth/2}" y="${templateHeight - 24}" text-anchor="middle" class="footer-certnum">Certificate Number:${escapeXml(certificateNumber)}</text>
      </svg>
      `;
    }

    // Validate SVG content
    if (!svgText.includes('<svg') || !svgText.includes('</svg>')) {
      throw new Error('Invalid SVG content generated');
    }
    
    console.log('SVG content preview (first 500 chars):', svgText.substring(0, 500));

    // Process image with text overlay
    try {
      console.log('Starting image processing...');
      console.log('Template dimensions:', templateMetadata.width, 'x', templateMetadata.height);
      console.log('SVG overlay length:', svgText.length);
      
      // Compose once into a buffer
      const composedBuffer = await sharp(templateBuffer)
        .composite([
          {
            input: Buffer.from(svgText),
            top: 0,
            left: 0,
          },
        ])
        .toBuffer();

      // Write full-quality PNG
      await sharp(composedBuffer).png().toFile(outputPath);

      // Also write a compressed WebP preview (downsized for faster loading)
      await sharp(composedBuffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(previewPath);

      console.log(`Certificate generated: ${outputPath}`);
      
      if (mapping) {
        console.log('Certificate generated using mapping-based positioning');
      } else {
        console.log('Certificate generated using default positioning');
      }
      
      // Verify the files were created and have content
      const stats = await fs.stat(outputPath);
      const previewExists = await fs.pathExists(previewPath);
      const previewStats = previewExists ? await fs.stat(previewPath) : { size: 0 };
      if (stats.size === 0) {
        throw new Error('Generated certificate file is empty');
      }
      console.log(`Certificate file size: ${stats.size} bytes, preview: ${previewStats.size} bytes`);
      
      // Return both file path and URL for frontend access
      // Ensure the URL uses the base URL if available for absolute URL
      const baseUrl = process.env.BASE_URL || "http://localhost:3000";
      const certificateUrl = `${baseUrl}/uploads/certificates/${outputFilename}`;
      const previewUrl = `${baseUrl}/uploads/certificates/${previewFilename}`;
      
      return {
        filePath: outputPath,
        url: certificateUrl,
        filename: outputFilename,
        relativeUrl: `/uploads/certificates/${outputFilename}` , // Also provide relative URL
        previewPath,
        previewUrl,
        previewFilename,
        previewRelativeUrl: `/uploads/certificates/${previewFilename}`
      };
    } catch (imageError) {
      console.error('Error during image processing:', imageError);
      
      // Clean up partial file if it exists
      try {
        if (await fs.pathExists(outputPath)) {
          await fs.unlink(outputPath);
        }
      } catch (cleanupError) {
        console.warn('Could not clean up partial file:', cleanupError.message);
      }
      
      throw new Error(`Image processing failed: ${imageError.message}`);
    }
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
};

module.exports = { generateCertificate };