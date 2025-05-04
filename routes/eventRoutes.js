const express = require("express");
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventCertificates,
} = require("../controllers/eventController");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

// Public routes
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// Admin routes
router.use(protect, authorize("admin"));
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);
router.get("/:id/certificates", getEventCertificates);

module.exports = router;
