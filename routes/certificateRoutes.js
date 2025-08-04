const express = require("express");
const {
  uploadTemplate,
  generateBulkCertificates,
  generateSingleCertificate,
  verifyCertificate,
  getAllCertificates,
  getMyCertificates,
  getCertificatesByCategory,
  updateCertificate,
  deleteCertificate,
  downloadCertificate,
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

// Multer middleware for multiple files
const uploadTemplateMiddleware = multer({
  storage: templateStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Increased to 10MB limit
  fileFilter: templateFilter,
});

const uploadCSVMiddleware = multer({
  storage: csvStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Increased to 10MB limit
  fileFilter: csvFilter,
});

// Combined middleware for bulk generation (CSV + Template + Optional Mapping)
const uploadBulkMiddleware = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'csv' || file.fieldname === 'mapping') {
        cb(null, csvDir);
      } else if (file.fieldname === 'template') {
        cb(null, templatesDir);
      } else {
        cb(new Error('Invalid field name'));
      }
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      if (file.fieldname === 'csv') {
        cb(null, `data-${timestamp}.csv`);
      } else if (file.fieldname === 'template') {
        cb(null, `template-${timestamp}${path.extname(file.originalname)}`);
      } else if (file.fieldname === 'mapping') {
        cb(null, `mapping-${timestamp}.json`);
      }
    },
  }),
  limits: { 
    fileSize: 10 * 1024 * 1024, // Increased to 10MB limit
    fieldSize: 2 * 1024 * 1024, // 2MB for form fields
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'csv') {
      const allowedTypes = /csv/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      if (extname) {
        return cb(null, true);
      } else {
        cb(new Error("Only CSV files are allowed for data!"));
      }
    } else if (file.fieldname === 'template') {
      const allowedTypes = /jpeg|jpg|png|gif/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      if (extname && mimetype) {
        return cb(null, true);
      } else {
        cb(new Error("Only image files are allowed for templates!"));
      }
    } else if (file.fieldname === 'mapping') {
      const allowedTypes = /json/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      if (extname) {
        return cb(null, true);
      } else {
        cb(new Error("Only JSON files are allowed for mapping!"));
      }
    } else {
      cb(new Error("Invalid field name"));
    }
  },
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded.',
      });
    }
    if (err.code === 'LIMIT_FIELD_VALUE') {
      return res.status(400).json({
        success: false,
        message: 'Field value too large.',
      });
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + err.message,
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Upload error',
    });
  }
  
  next();
};

const router = express.Router();

// Public routes
router.get("/verify/:certificateId", verifyCertificate);
router.get("/verify", verifyCertificate); // Support query parameter
router.get("/download/:certificateId", downloadCertificate);
router.get("/download", downloadCertificate); // Support query parameter

// User routes
router.get("/my-certificates", protect, getMyCertificates);

// Certificate CRUD operations (before admin middleware)
router.put("/:id", protect, authorize("admin"), uploadTemplateMiddleware.single("image"), updateCertificate);
router.delete("/:id", protect, authorize("admin"), deleteCertificate);

// Admin routes
router.get("/admin", protect, authorize("admin"), getAllCertificates);
router.get("/category/:categoryId", protect, authorize("admin"), getCertificatesByCategory);
router.post(
  "/admin/templates",
  protect, 
  authorize("admin"),
  uploadTemplateMiddleware.single("template"),
  uploadTemplate
);
router.post(
  "/admin/generate",
  protect,
  authorize("admin"),
  (req, res, next) => {
    uploadBulkMiddleware.fields([
      { name: 'csv', maxCount: 1 },
      { name: 'template', maxCount: 1 },
      { name: 'mapping', maxCount: 1 }
    ])(req, res, (err) => {
      handleMulterError(err, req, res, next);
    });
  },
  generateBulkCertificates
);
router.post("/admin/generate-single", protect, authorize("admin"), generateSingleCertificate);

module.exports = router;
