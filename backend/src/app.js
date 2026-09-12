// src/app.js
const express = require("express");
const cors = require("cors");
const authController = require("./controllers/auth.controller.js");
const hotRoutes = require("./routes/hot.routes.js");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log("[REQ] " + req.method + " " + req.originalUrl);
  next();
});

app.use("/api/hot", hotRoutes);

app.post("/api/auth/login", authController.login);
app.post("/api/auth/register", authController.register);
app.get("/api/auth/me", authController.authenticateToken, authController.getCurrentUser);
app.get("/api/auth/health", (_req, res) => res.json({ message: true }));
app.get("/api/auth/ping", (_req, res) => res.json({ ok: true }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "success", message: "Hello, API IS RUNNING!" });
});

module.exports = app;
