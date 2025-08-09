const { Certificate, Event, User, Category } = require("../models");
const { generateCertificate } = require("../utils/certificateGenerator");
const csvParser = require("csv-parser");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// Upload certificate template
exports.uploadTemplate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No template file uploaded",
      });
    }

    res.status(200).json({
      success: true,
      message: "Template uploaded successfully",
      templatePath: req.file.path,
      filename: req.file.filename,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error uploading template",
      error: error.message,
    });
  }
};

// Generate bulk certificates from CSV
exports.generateBulkCertificates = async (req, res) => {
  try {
    console.log('=== Bulk Certificate Generation Started ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files ? Object.keys(req.files) : 'No files');
    
    const { eventId, positioning_method } = req.body;

    // Check for required files - mapping is optional
    if (!req.files || !req.files.csv || !req.files.template) {
      console.error('Missing required files:', {
        hasFiles: !!req.files,
        hasCSV: !!(req.files && req.files.csv),
        hasTemplate: !!(req.files && req.files.template)
      });
      
      return res.status(400).json({
        success: false,
        message: "CSV file and template file are required",
      });
    }

    const csvFile = req.files.csv[0];
    const templateFile = req.files.template[0];
    const mappingFile = req.files.mapping ? req.files.mapping[0] : null;

    console.log('Files received:', {
      csv: { originalname: csvFile.originalname, size: csvFile.size, path: csvFile.path },
      template: { originalname: templateFile.originalname, size: templateFile.size, path: templateFile.path },
      mapping: mappingFile ? { originalname: mappingFile.originalname, size: mappingFile.size, path: mappingFile.path } : null
    });

    if (!eventId) {
      console.error('Missing eventId in request');
      return res.status(400).json({
        success: false,
        message: "Event ID is required",
      });
    }

    // Validate integer format
    const eventIdInt = parseInt(eventId, 10);
    if (isNaN(eventIdInt) || eventIdInt <= 0) {
      console.error('Invalid eventId format:', eventId);
      return res.status(400).json({
        success: false,
        message: "Invalid event ID format. Expected positive integer.",
      });
    }

    // Verify event exists
    console.log('Looking up event with ID:', eventIdInt);
    const event = await Event.findByPk(eventIdInt);
    if (!event) {
      console.error('Event not found:', eventIdInt);
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }
    
    console.log('Event found:', { id: event.event_id, name: event.name, date: event.eventDate });

    // Parse CSV file with timeout
    const results = [];
    const certificatesCreated = [];
    let isCompleted = false;

    // Set a timeout for CSV processing
    const timeoutId = setTimeout(() => {
      if (!isCompleted) {
        isCompleted = true;
        
        // Clean up uploaded files on timeout
        try {
          fs.unlinkSync(csvFile.path);
          if (mappingFile) fs.unlinkSync(mappingFile.path);
        } catch (cleanupError) {
          console.warn("Error cleaning up uploaded files after timeout:", cleanupError.message);
        }
        
        return res.status(408).json({
          success: false,
          message: "Request timeout - CSV processing took too long",
        });
      }
    }, 60000); // 60 second timeout

    const stream = fs.createReadStream(csvFile.path)
      .pipe(csvParser())
      .on("data", (data) => {
        results.push(data);
      })
      .on("end", async () => {
        if (isCompleted) return;
        clearTimeout(timeoutId);
        isCompleted = true;
        
        try {
          for (const row of results) {
            try {
              console.log(`Processing certificate for: ${row.name || row.recipientName}`);
              
              // Generate unique certificate number
              const certificateNumber = `CERT-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)
                .toUpperCase()}`;
              
              const verificationUrl = `${
                process.env.BASE_URL || "http://localhost:3000"
              }/api/certificates/verify/${certificateNumber}`;

              // Generate certificate image
              console.log('Calling generateCertificate with data:', {
                recipientName: row.name || row.recipientName,
                eventName: event.name,
                eventDate: event.eventDate,
                templatePath: templateFile.path,
                certificateNumber: certificateNumber,
                mappingPath: mappingFile ? mappingFile.path : null,
                additionalFields: Object.keys(row)
              });
              
              const certificateResult = await generateCertificate({
                recipientName: row.name || row.recipientName,
                eventName: event.name,
                eventDate: event.eventDate,
                templatePath: templateFile.path,
                certificateNumber: certificateNumber,
                mappingPath: mappingFile ? mappingFile.path : null,
                ...row, // Additional fields from CSV
              });
              
              console.log('Certificate generation result:', certificateResult);

              // Check if user exists
              let user = null;
              if (row.email || row.recipientEmail) {
                const email = row.email || row.recipientEmail;
                user = await User.findOne({
                  where: { email: email },
                });
              }

              // Create certificate record with URL
              const certificate = await Certificate.create({
                recipientName: row.name || row.recipientName,
                recipientEmail: row.email,
                certificateNumber,
                templatePath: templateFile.path,
                certificatePath: certificateResult.filePath,
                certificateUrl: certificateResult.url, // Use the full URL
                verificationUrl,
                eventId: eventIdInt,
                issuedTo: user ? user.user_id : null,
                additionalFields: row,
              });

              // Include related data for frontend
              const certificateWithRelations = await Certificate.findByPk(certificate.cert_id, {
                include: [
                  {
                    model: Event,
                    attributes: ["event_id", "name", "eventDate"],
                  },
                  {
                    model: User,
                    as: "recepient",
                    attributes: ["user_id", "name", "email"],
                  },
                ],
              });

              certificatesCreated.push(certificateWithRelations);
              console.log(`Certificate created successfully for ${row.name || row.recipientName}`);
              
            } catch (rowError) {
              console.error(`Error processing certificate for ${row.name || row.recipientName}:`, rowError);
              // Continue processing other rows instead of breaking the entire batch
            }
          }

          // Clean up uploaded files
          try {
            fs.unlinkSync(csvFile.path);
            if (mappingFile) fs.unlinkSync(mappingFile.path);
          } catch (cleanupError) {
            console.warn("Error cleaning up uploaded files:", cleanupError.message);
          }

          res.status(201).json({
            success: true,
            message: `${certificatesCreated.length} certificates generated successfully`,
            data: certificatesCreated,
          });
        } catch (error) {
          console.error("Error generating certificates:", error);
          
          // Clean up uploaded files on error
          try {
            fs.unlinkSync(csvFile.path);
            if (mappingFile) fs.unlinkSync(mappingFile.path);
          } catch (cleanupError) {
            console.warn("Error cleaning up uploaded files after error:", cleanupError.message);
          }
          
          res.status(500).json({
            success: false,
            message: "Error generating certificates",
            error: error.message,
          });
        }
      })
      .on("error", (error) => {
        if (isCompleted) return;
        clearTimeout(timeoutId);
        isCompleted = true;
        
        console.error("Error parsing CSV file:", error);
        
        // Clean up uploaded files on error
        try {
          fs.unlinkSync(csvFile.path);
          if (mappingFile) fs.unlinkSync(mappingFile.path);
        } catch (cleanupError) {
          console.warn("Error cleaning up uploaded files after CSV error:", cleanupError.message);
        }
        
        res.status(500).json({
          success: false,
          message: "Error parsing CSV file",
          error: error.message,
        });
      });
  } catch (error) {
    console.error("Error processing bulk certificates:", error);
    res.status(500).json({
      success: false,
      message: "Error processing bulk certificates",
      error: error.message,
    });
  }
};

// Generate single certificate
exports.generateSingleCertificate = async (req, res) => {
  try {
    // Support aliases from frontend
    const body = req.body || {};
    const recipientName = body.recipientName || body.name;
    const recipientEmail = body.recipientEmail || body.email;
    const rawEventId = body.eventId;

    // Determine template path in a flexible way
    let resolvedTemplatePath = body.templatePath || null;

    // If client uploaded a template file in this request
    if (req.file && req.file.path) {
      resolvedTemplatePath = req.file.path;
    }

    // If a filename is provided, resolve against uploads/templates
    if (!resolvedTemplatePath && body.templateFilename) {
      const templatesDir = path.join(__dirname, "../uploads/templates");
      resolvedTemplatePath = path.join(templatesDir, body.templateFilename);
    }

    // If still not provided, use the most recent template in uploads/templates
    if (!resolvedTemplatePath) {
      try {
        const templatesDir = path.join(__dirname, "../uploads/templates");
        if (fs.existsSync(templatesDir)) {
          const files = fs
            .readdirSync(templatesDir)
            .filter((f) => /\.(png|jpg|jpeg)$/i.test(f))
            .map((name) => ({
              name,
              time: fs.statSync(path.join(templatesDir, name)).mtime.getTime(),
            }))
            .sort((a, b) => b.time - a.time);
          if (files.length > 0) {
            resolvedTemplatePath = path.join(templatesDir, files[0].name);
          }
        }
      } catch (e) {
        // ignore and fall through to validation error
      }
    }

    // Validate inputs
    const eventId = parseInt(rawEventId, 10);
    if (!recipientName || !recipientEmail || !eventId || !resolvedTemplatePath) {
      return res.status(400).json({
        success: false,
        message:
          "Recipient name, email, event ID, and template are required. You may upload 'template' file, pass 'templatePath', 'templateFilename', or rely on most recent uploaded template.",
      });
    }

    // Verify event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if certificate already exists for this recipient and event
    const existingCertificate = await Certificate.findOne({
      where: {
        recipientEmail,
        eventId,
      },
    });

    if (existingCertificate) {
      return res.status(400).json({
        success: false,
        message: "Certificate already exists for this recipient and event",
      });
    }

    // Generate certificate number
    const certificateNumber = `CERT-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    try {
      // Generate the certificate image
      const certificateResult = await generateCertificate({
        recipientName,
        eventName: event.name,
        eventDate: event.eventDate,
        templatePath: resolvedTemplatePath,
        certificateNumber,
        mappingPath: null,
      });

      // Save certificate to database
      const certificate = await Certificate.create({
        recipientName,
        recipientEmail,
        certificateNumber,
        eventId,
        issueDate: new Date(),
        certificatePath: certificateResult.filePath,
        certificateUrl: certificateResult.url,
        templatePath: resolvedTemplatePath,
        verificationUrl: `${
          process.env.BASE_URL || "http://localhost:3000"
        }/api/certificates/verify/${certificateNumber}`,
        emailSent: false,
        isVerified: false,
      });

      res.status(201).json({
        success: true,
        message: "Certificate generated successfully",
        data: certificate,
      });
    } catch (genError) {
      console.error("Certificate generation error:", genError);
      return res.status(500).json({
        success: false,
        message: "Error generating certificate image",
        error: genError.message,
      });
    }
  } catch (error) {
    console.error("Error generating certificate:", error);
    res.status(500).json({
      success: false,
      message: "Error generating certificate",
      error: error.message,
    });
  }
};

// Verify certificate
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const { id } = req.query; // Support both /verify/:id and /verify?id=123

    const searchId = certificateId || id;

    if (!searchId) {
      return res.status(400).json({
        success: false,
        message: "Certificate ID is required",
      });
    }

    const certificate = await Certificate.findOne({
      where: { certificateNumber: searchId },
      include: [
        {
          model: Event,
          attributes: ["name", "eventDate", "description"],
          include: [
            {
              model: Category,
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    // Check if certificate file exists
    const certificateExists = fs.existsSync(certificate.certificatePath);
    
    // Generate URLs for the certificate
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const certificateDownloadUrl = `${baseUrl}/api/certificates/download/${certificate.certificateNumber}`;
    
    // Provide multiple URL options for certificate access
    let certificateDisplayUrl = certificate.certificateUrl;
    
    // If the stored URL is relative, make it absolute
    if (certificateDisplayUrl && certificateDisplayUrl.startsWith('/uploads/')) {
      certificateDisplayUrl = `${baseUrl}${certificateDisplayUrl}`;
    }
    
    // Fallback to download URL if file doesn't exist at static path
    if (!certificateExists) {
      certificateDisplayUrl = certificateDownloadUrl;
    }
    
    res.status(200).json({
      success: true,
      message: "Certificate verified successfully",
      data: {
        certificateNumber: certificate.certificateNumber,
        name: certificate.recipientName, // Frontend expects 'name'
        email: certificate.recipientEmail, // Frontend expects 'email'
        event: certificate.Event ? certificate.Event.name : 'Unknown Event', // Frontend expects event as string
        category: certificate.Event && certificate.Event.Category ? certificate.Event.Category.name : 'Unknown Category', // Frontend expects category
        created_at: certificate.createdAt, // Frontend expects 'created_at'
        certificate_url: certificateDisplayUrl, // Use the processed URL
        
        // Keep the additional fields for backward compatibility
        recipientName: certificate.recipientName,
        recipientEmail: certificate.recipientEmail,
        eventObject: certificate.Event,
        issuedAt: certificate.createdAt,
        certificateUrl: certificateDisplayUrl, // Also update this field
        certificateDownloadUrl, // Direct download URL
        certificateExists, // Let frontend know if file exists
        additionalFields: certificate.additionalFields,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verifying certificate",
      error: error.message,
    });
  }
};

// Get certificates by category
exports.getCertificatesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log("CategoryId: ",categoryId)

    // First, find all events that belong to this category
    const events = await Event.findAll({
      where: { categoryId: categoryId },
      attributes: ["event_id"],
    });

    console.log("Feteched Events:",events);

    if (events.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Get event IDs
    const eventIds = events.map(event => event.event_id);

    console.log(eventIds)
    // Get certificates for these events
    const certificates = await Certificate.findAll({
      where: {
        eventId: eventIds,
      },
      include: [
        {
          model: Event,
          attributes: ["event_id", "name", "eventDate"],
        },
        {
          model: User,
          as: "recepient",
          attributes: ["user_id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching certificates by category",
      error: error.message,
    });
  }
};

// Get all certificates (admin)
exports.getAllCertificates = async (req, res) => {
  try {
    const { eventId, emailSent, isVerified } = req.query;
    const whereClause = {};

    if (eventId) {
      whereClause.eventId = eventId;
    }

    if (emailSent !== undefined) {
      whereClause.emailSent = emailSent === "true";
    }

    if (isVerified !== undefined) {
      whereClause.isVerified = isVerified === "true";
    }

    const certificates = await Certificate.findAll({
      where: whereClause,
      include: [
        {
          model: Event,
          attributes: ["event_id", "name"],
        },
        {
          model: User,
          as: "recepient",
          attributes: ["user_id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching certificates",
      error: error.message,
    });
  }
};

// Get user's certificates
exports.getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.findAll({
      where: { issuedTo: req.user.user_id },
      include: [
        {
          model: Event,
          attributes: ["event_id", "name", "eventDate"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching certificates",
      error: error.message,
    });
  }
};

// Update certificate
exports.updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { recipientName, recipientEmail, eventId } = req.body;

    // Find the certificate
    const certificate = await Certificate.findByPk(id);
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    // Update fields
    const updateData = {};
    if (recipientName) updateData.recipientName = recipientName;
    if (recipientEmail) updateData.recipientEmail = recipientEmail;
    if (eventId) updateData.eventId = eventId;

    // Handle image/template update if provided
    if (req.file) {
      updateData.templatePath = req.file.path;
      // Regenerate certificate if template changed
      try {
        const event = await Event.findByPk(eventId || certificate.eventId);
        const certificateResult = await generateCertificate({
          recipientName: recipientName || certificate.recipientName,
          eventName: event.name,
          eventDate: event.eventDate,
          templatePath: req.file.path,
          certificateNumber: certificate.certificateNumber,
        });
        updateData.certificatePath = certificateResult.filePath;
        updateData.certificateUrl = certificateResult.url; // Update URL too
      } catch (genError) {
        console.error("Error regenerating certificate:", genError);
      }
    }

    // Update the certificate
    await certificate.update(updateData);

    // Fetch updated certificate with relations
    const updatedCertificate = await Certificate.findByPk(id, {
      include: [
        {
          model: Event,
          attributes: ["event_id", "name", "eventDate"],
        },
        {
          model: User,
          as: "recepient",
          attributes: ["user_id", "name", "email"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Certificate updated successfully",
      data: updatedCertificate,
    });
  } catch (error) {
    console.error("Error updating certificate:", error);
    res.status(500).json({
      success: false,
      message: "Error updating certificate",
      error: error.message,
    });
  }
};

// Delete certificate
exports.deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the certificate
    const certificate = await Certificate.findByPk(id);
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    // Delete certificate files if they exist
    try {
      if (certificate.certificatePath && fs.existsSync(certificate.certificatePath)) {
        fs.unlinkSync(certificate.certificatePath);
      }
    } catch (fileError) {
      console.warn("Could not delete certificate file:", fileError.message);
    }

    // Delete the certificate record
    await certificate.destroy();

    res.status(200).json({
      success: true,
      message: "Certificate deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting certificate:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting certificate",
      error: error.message,
    });
  }
};

// Serve certificate file for download/display
exports.downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const { id } = req.query; // Support both /download/:id and /download?id=123

    const searchId = certificateId || id;

    if (!searchId) {
      return res.status(400).json({
        success: false,
        message: "Certificate ID is required",
      });
    }

    const certificate = await Certificate.findOne({
      where: { certificateNumber: searchId },
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    // Check if certificate file exists
    if (!fs.existsSync(certificate.certificatePath)) {
      return res.status(404).json({
        success: false,
        message: "Certificate file not found",
      });
    }

    // Set appropriate headers for image display
    const fileExtension = path.extname(certificate.certificatePath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (fileExtension === '.png') {
      contentType = 'image/png';
    } else if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (fileExtension === '.pdf') {
      contentType = 'application/pdf';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${certificate.recipientName}_certificate${fileExtension}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(certificate.certificatePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error("Error downloading certificate:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading certificate",
      error: error.message,
    });
  }
};
