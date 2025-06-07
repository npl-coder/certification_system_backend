const { Certificate, Event } = require("../models");
const sendEmail = require("../utils/emailService");
const { Op } = require("sequelize");

// Send certificate via email
exports.sendCertificateEmail = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findByPk(certificateId, {
      include: [
        {
          model: Event,
          attributes: ["name", "eventDate"],
        },
      ],
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    // Prepare email content
    const emailOptions = {
      to: certificate.recipientEmail,
      subject: `Your Certificate - ${certificate.Event.name}`,
      html: `
        <h2>Congratulations!</h2>
        <p>Dear ${certificate.recipientName},</p>
        <p>Your certificate for ${certificate.Event.name} is attached below.</p>
        <p>You can verify your certificate authenticity at: ${certificate.verificationUrl}</p>
        <p>Certificate Number: ${certificate.certificateNumber}</p>
        <br>
        <p>Best regards,<br>The Certification Team</p>
      `,
      attachments: [
        {
          filename: `certificate-${certificate.certificateNumber}.png`,
          path: certificate.certificatePath,
        },
      ],
    };

    const result = await sendEmail(emailOptions);

    // Update certificate email status
    await certificate.update({ emailSent: true });

    res.status(200).json({
      success: true,
      message: "Certificate sent successfully",
      data: {
        certificateNumber: certificate.certificateNumber,
        recipientEmail: certificate.recipientEmail,
        emailId: result.messageId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending certificate email",
      error: error.message,
    });
  }
};

// Send bulk emails for an event
exports.sendBulkEmails = async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required",
      });
    }

    // Get all certificates for the event that haven't been sent
    const certificates = await Certificate.findAll({
      where: {
        eventId,
        emailSent: false,
        recipientEmail: {
          [Op.ne]: null,
        },
      },
      include: [
        {
          model: Event,
          attributes: ["name", "eventDate"],
        },
      ],
    });

    if (certificates.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No certificates found to send",
      });
    }

    const results = {
      successful: [],
      failed: [],
    };

    // Process emails sequentially to avoid overwhelming the email server
    for (const certificate of certificates) {
      try {
        const emailOptions = {
          to: certificate.recipientEmail,
          subject: `Your Certificate - ${certificate.Event.name}`,
          html: `
            <h2>Congratulations!</h2>
            <p>Dear ${certificate.recipientName},</p>
            <p>Your certificate for ${certificate.Event.name} is attached below.</p>
            <p>You can verify your certificate authenticity at: ${certificate.verificationUrl}</p>
            <p>Certificate Number: ${certificate.certificateNumber}</p>
            <br>
            <p>Best regards,<br>The Certification Team</p>
          `,
          attachments: [
            {
              filename: `certificate-${certificate.certificateNumber}.png`,
              path: certificate.certificatePath,
            },
          ],
        };

        const result = await sendEmail(emailOptions);
        await certificate.update({ emailSent: true });

        results.successful.push({
          certificateNumber: certificate.certificateNumber,
          recipientEmail: certificate.recipientEmail,
          emailId: result.messageId,
        });
      } catch (error) {
        results.failed.push({
          certificateNumber: certificate.certificateNumber,
          recipientEmail: certificate.recipientEmail,
          error: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk email process completed`,
      data: {
        totalProcessed: certificates.length,
        successful: results.successful.length,
        failed: results.failed.length,
        details: results,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending bulk emails",
      error: error.message,
    });
  }
};

// Get email status for certificates
exports.getEmailStatus = async (req, res) => {
  try {
    const { eventId } = req.query;
    const whereClause = {};

    if (eventId) {
      whereClause.eventId = eventId;
    }

    const certificates = await Certificate.findAll({
      where: whereClause,
      attributes: [
        "cert_id",
        "certificateNumber",
        "recipientName",
        "recipientEmail",
        "emailSent",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: Event,
          attributes: ["event_id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const summary = {
      total: certificates.length,
      sent: certificates.filter((cert) => cert.emailSent).length,
      pending: certificates.filter((cert) => !cert.emailSent).length,
    };

    res.status(200).json({
      success: true,
      summary,
      data: certificates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching email status",
      error: error.message,
    });
  }
};
