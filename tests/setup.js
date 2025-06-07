// Test setup file
require("dotenv").config({ path: ".env.test" });

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.DB_NAME = "certification_system_test";
process.env.JWT_SECRET = "test_jwt_secret_key";

// Increase timeout for database operations
jest.setTimeout(30000);

// Database setup for tests
const { db } = require("../config/database");

beforeAll(async () => {
  try {
    // Force sync to recreate tables for testing
    await db.sync({ force: true });
    console.log("Test database synced successfully");
  } catch (error) {
    console.error("Test database sync failed:", error);
    throw error;
  }
});

afterAll(async () => {
  try {
    await db.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error closing database:", error);
  }
});

// Global test helpers
global.testHelpers = {
  createTestUser: (role = "user") => ({
    name: `Test ${role}`,
    email: `test-${role}-${Date.now()}@example.com`,
    password: "password123",
    role: role,
  }),

  createTestCategory: () => ({
    name: `Test Category ${Date.now()}`,
    description: "Test category description",
  }),

  createTestEvent: (categoryId) => ({
    name: `Test Event ${Date.now()}`,
    description: "Test event description",
    eventDate: new Date().toISOString(),
    location: "Test Location",
    categoryId: categoryId,
  }),
};
