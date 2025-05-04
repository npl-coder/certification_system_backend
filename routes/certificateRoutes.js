const express = require("express");
const {
  uploadTemplate,
  generateBulkCertificates,
  verifyCertificate,
  getAllCertificates,
  getMyCertificates,
} = require("../controllers/certificateController");
const { protect, authorize } = require("../middlewares/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Set up multer storage for file uploads
// Ensure uploads directories exist
const templatesDir = path.join(__dirname, "../uploads/templates");
const csvDir = path.join(__dirname, "../uploads/csv");

if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

if (!fs.existsSync(csvDir)) {
  fs.mkdirSync(csvDir, { recursive: true });
}

// Storage configuration for templates
const templateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, templatesDir);
  },
  filename: (req, file, cb) => {
    cb(null, `template-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Storage configuration for CSV files
const csvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, csvDir);
  },
  filename: (req, file, cb) => {
    cb(null, `data-${Date.now()}.csv`);
  },
});

// Filter for template files
const templateFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed for templates!"));
  }
};

// Filter for CSV files
const csvFilter = (req, file, cb) => {
  const allowedTypes = /csv/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only CSV files are allowed!"));
  }
};

// Multer middleware
const uploadTemplateMiddleware = multer({
  storage: templateStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: templateFilter,
});

const uploadCSVMiddleware = multer({
  storage: csvStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: csvFilter,
});

const router = express.Router();

// Public routes
router.get("/verify/:certificateId", verifyCertificate);

// User routes
router.get("/my-certificates", protect, getMyCertificates);

// Admin routes
router.use("/admin", protect, authorize("admin"));
router.get("/admin", getAllCertificates);
router.post(
  "/admin/templates",
  uploadTemplateMiddleware.single("template"),
  uploadTemplate
);
router.post(
  "/admin/generate",
  uploadCSVMiddleware.single("csv"),
  generateBulkCertificates
);

module.exports = router;
