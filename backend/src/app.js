// src/app.js
const express = require("express");
const cors = require("cors");
const authController = require("./controllers/auth.controller.js");
const hotRoutes = require("./routes/hot.routes.js");

const app = express();

app.use(cors());
app.use(express.json());

// 打印每个请求的真实路径，方便以后调试
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

// ===== 热点路由 =====
app.use("/api/hot", hotRoutes);

// ===== 认证路由（直接内联，不再经过 auth.routes.js） =====
app.post("/api/auth/login", authController.login);
app.post("/api/auth/register", authController.register);
app.get("/api/auth/me", authController.authenticateToken, authController.getCurrentUser);
app.get("/api/auth/health", (_req, res) => res.json({ message: true }));
app.get("/api/auth/ping", (_req, res) => res.json({ ok: true }));
app.post("/api/auth/post-test", (_req, res) => res.json({ message: "POST works!" }));

// ===== 健康检查 =====
app.get("/api/health", (_req, res) => {
  res.json({ status: "success", message: "Hello, API IS RUNNING!" });
});

module.exports = app;