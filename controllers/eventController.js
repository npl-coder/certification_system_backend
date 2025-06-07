const { Event, Category, Certificate } = require("../models");
const { Op } = require("sequelize");

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { name, description, eventDate, location, categoryId } = req.body;

    // Verify category exists if provided
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }
    }

    const event = await Event.create({
      name,
      description,
      eventDate,
      location,
      categoryId,
    });

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating event",
      error: error.message,
    });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const { categoryId, upcoming, past } = req.query;
    const whereClause = {};

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (upcoming === "true") {
      whereClause.eventDate = {
        [Op.gte]: new Date(),
      };
    }

    if (past === "true") {
      whereClause.eventDate = {
        [Op.lt]: new Date(),
      };
    }

    const events = await Event.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          attributes: ["category_id", "name"],
        },
      ],
      order: [["eventDate", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message,
    });
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          attributes: ["category_id", "name", "description"],
        },
      ],
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Get certificate count for this event
    const certificateCount = await Certificate.count({
      where: { eventId: req.params.id },
    });

    res.status(200).json({
      success: true,
      data: {
        ...event.toJSON(),
        certificateCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching event",
      error: error.message,
    });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // If updating category, verify it exists
    if (req.body.categoryId) {
      const category = await Category.findByPk(req.body.categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }
    }

    const updatedEvent = await event.update(req.body);

    res.status(200).json({
      success: true,
      data: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating event",
      error: error.message,
    });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if there are certificates for this event
    const certificateCount = await Certificate.count({
      where: { eventId: req.params.id },
    });

    if (certificateCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete event that has certificates issued",
      });
    }

    await event.destroy();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting event",
      error: error.message,
    });
  }
};

// Get certificates for an event
exports.getEventCertificates = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const certificates = await Certificate.findAll({
      where: { eventId: req.params.id },
      include: [
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
      event: event.name,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching event certificates",
      error: error.message,
    });
  }
};
