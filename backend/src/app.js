// src/app.js

const express = require("express");
const cors = require("cors");
const authRouter = require("./routes/auth.routes.js");
const hotRoutes = require("./routes/hot.routes.js");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/hot", hotRoutes);
app.use("/api/auth", authRouter);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "success",
    message: "Hello, API IS RUNNING!"
  });
});

module.exports = app;