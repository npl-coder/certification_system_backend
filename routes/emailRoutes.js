const express = require("express");
const {
  sendCertificateEmail,
  sendBulkEmails,
  getEmailStatus,
} = require("../controllers/emailController");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

router.use(protect, authorize("admin"));
router.post("/send/:certificateId", sendCertificateEmail);
router.post("/bulk", sendBulkEmails);
router.get("/status", getEmailStatus);

module.exports = router;
