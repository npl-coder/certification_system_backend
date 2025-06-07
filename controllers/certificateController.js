const { Certificate, Event, User } = require("../models");
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
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No CSV file uploaded",
      });
    }

    const { eventId, templatePath } = req.body;

    if (!eventId || !templatePath) {
      return res.status(400).json({
        success: false,
        message: "Event ID and template path are required",
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

    // Parse CSV file
    const results = [];
    const certificatesCreated = [];

    fs.createReadStream(req.file.path)
      .pipe(csvParser())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          for (const row of results) {
            const certificateNumber = `CERT-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 5)
              .toUpperCase()}`;
            const verificationUrl = `${
              process.env.FRONTEND_URL || "http://localhost:3000"
            }/verify/${certificateNumber}`;

            // Generate certificate image
            const certificatePath = await generateCertificate({
              recipientName: row.name || row.recipientName,
              eventName: event.name,
              eventDate: event.eventDate,
              templatePath: templatePath,
              certificateNumber: certificateNumber,
              ...row, // Additional fields from CSV
            });

            // Check if user exists
            let user = null;
            if (row.email) {
              user = await User.findOne({
                where: { email: row.email },
              });
            }

            // Create certificate record
            const certificate = await Certificate.create({
              recipientName: row.name || row.recipientName,
              recipientEmail: row.email,
              certificateNumber,
              templatePath,
              certificatePath,
              verificationUrl,
              eventId,
              issuedTo: user ? user.user_id : null,
              additionalFields: row,
            });

            certificatesCreated.push(certificate);
          }

          // Clean up CSV file
          fs.unlinkSync(req.file.path);

          res.status(201).json({
            success: true,
            message: `${certificatesCreated.length} certificates generated successfully`,
            data: certificatesCreated,
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            message: "Error generating certificates",
            error: error.message,
          });
        }
      })
      .on("error", (error) => {
        res.status(500).json({
          success: false,
          message: "Error parsing CSV file",
          error: error.message,
        });
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing bulk certificates",
      error: error.message,
    });
  }
};

// Verify certificate
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({
      where: { certificateNumber: certificateId },
      include: [
        {
          model: Event,
          include: [
            {
              model: Category,
              attributes: ["name"],
            },
          ],
        },
        {
          model: User,
          as: "recepient",
          attributes: ["name", "email"],
        },
      ],
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    // Update verification status
    if (!certificate.isVerified) {
      await certificate.update({ isVerified: true });
    }

    res.status(200).json({
      success: true,
      message: "Certificate is valid",
      data: {
        certificateNumber: certificate.certificateNumber,
        recipientName: certificate.recipientName,
        recipientEmail: certificate.recipientEmail,
        issueDate: certificate.issueDate,
        eventName: certificate.Event.name,
        eventDate: certificate.Event.eventDate,
        category: certificate.Event.Category
          ? certificate.Event.Category.name
          : null,
        isVerified: true,
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
