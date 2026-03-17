const express = require("express");
const { connectDB } = require("./config/database");
const app = express();
require("dotenv").config();






connectDB()
  .then(() => {
    console.log("DB connection established");
    app.listen(process.env.PORT, () => {
      console.log("Server is listening on port " + process.env.PORT);
    });
  })
  .catch((err) => {
    console.log("DB cannot be Connected" + err);
  });
