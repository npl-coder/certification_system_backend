const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

require("dotenv").config();

// Import database connection
const db = require("./config/database");

//Import Routes

//Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

//Middleware

//Routes

//Error Handling middleware

//Connect to Database and start the server
db.authenticate()
  .then(() => {
    console.log("Database connection established successfully.");
    //Sync models with database
    return db.sync({ alter: true });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Unable to connect to the database:", err);
  });
