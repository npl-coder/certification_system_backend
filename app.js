const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

require("dotenv").config();

// Import database connection
const db = require("./config/database");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const eventRoutes = require("./routes/eventRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const emailRoutes = require("./routes/emailRoutes");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS
app.use(morgan("dev")); // Logging
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Static file serving for uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/emails", emailRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// Connect to Database and start the server
db.authenticate()
  .then(() => {
    console.log("Database connection established successfully.");
    // Sync models with database
    return db.sync({ alter: true });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
    process.exit(1);
  });

module.exports = app;
