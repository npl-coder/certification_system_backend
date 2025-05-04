const express = require("express");
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

// Public routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Admin routes
router.use(protect, authorize("admin"));
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
