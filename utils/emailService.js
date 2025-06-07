const nodemailer = require("nodemailer");

// Create transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || "Certification System",
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      },
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
