// src/app.js
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 打印所有请求路径，确认路由是否到达
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

// 测试 hot 路由
const hotRoutes = require("./routes/hot.routes.js");
app.use("/api/hot", hotRoutes);

// 测试 auth 路由，并打印加载结果
try {
  const authRouter = require("./routes/auth.routes.js");
  console.log("[OK] auth.routes.js 加载成功, 类型:", typeof authRouter);
  console.log("[OK] authRouter.stack 长度:", authRouter?.stack?.length);
  app.use("/api/auth", authRouter);
} catch (err) {
  console.error("[FAIL] auth.routes.js 加载失败:", err);
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "success", message: "Hello, API IS RUNNING!" });
});

module.exports = app;