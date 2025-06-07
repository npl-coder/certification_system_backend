const { Category, Event } = require("../models");

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const category = await Category.create({
      name,
      description,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating category",
      error: error.message,
    });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Event,
          attributes: ["event_id", "name"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        {
          model: Event,
          attributes: ["event_id", "name", "eventDate", "location"],
        },
      ],
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching category",
      error: error.message,
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const updatedCategory = await category.update(req.body);

    res.status(200).json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating category",
      error: error.message,
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if there are events using this category
    const eventCount = await Event.count({
      where: { categoryId: req.params.id },
    });

    if (eventCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category that has associated events",
      });
    }

    await category.destroy();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting category",
      error: error.message,
    });
  }
};
