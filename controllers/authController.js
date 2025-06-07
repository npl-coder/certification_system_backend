const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../models");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    {
      userId: userId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Create new user (password will be hashed automatically by model hooks)
    const user = await User.create({
      name,
      email,
      password, // Don't hash here - the model will do it automatically
      role: role || "user",
    });

    // Generate token
    const token = generateToken(user.user_id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    console.log("Login attempt for:", email);

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    console.log("User found:", user ? user.email : "No user found");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Debug password information
    console.log("Entered password:", password);
    console.log("Stored hash length:", user.password.length);
    console.log("Hash starts with $2b$:", user.password.startsWith("$2b$"));

    // Use the model's comparePassword method
    const isMatch = await user.comparePassword(password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user.user_id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      attributes: ["user_id", "name", "email", "role"],
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving user",
      error: error.message,
    });
  }
};
