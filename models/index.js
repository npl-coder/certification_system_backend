const sequelize = require("../config/database");
const User = require("./user");
const Category = require("./category");
const Event = require("./event");
const Certificate = require("./certificate");

// Associations
Category.hasMany(Event, { foreignKey: "categoryId" });
Event.belongsTo(Category, { foreignKey: "categoryId" });

Event.hasMany(Certificate, { foreignKey: "eventId" });
Certificate.belongsTo(Event, { foreignKey: "eventId" });

User.hasMany(Certificate, {
  foreignKey: "issuedTo",
  as: "receivedCertificates",
});
Certificate.belongsTo(User, { foreignKey: "issuedTo", as: "recepient" });

// Sync Data Models with database

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: process.env.NODE_ENV === "development" });
    console.log("Database synchronized successfully");
  } catch (error) {
    console.error("Unable to synchronize the database", error);
  }
};

module.exports = {
  sequelize,
  User,
  Category,
  Event,
  Certificate,
  syncDatabase,
};
