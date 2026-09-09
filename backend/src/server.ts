// src/server.ts
const express = require("express");
const cors = require("cors");

console.log("🚀 服务器启动中...");

// ===== 加载路由 =====
console.log("📦 加载 auth.routes...");
const authRouter = require("./routes/auth.routes");
console.log("✅ auth.routes 加载完成");

console.log("📦 加载 hot.routes...");
const hotRoutes = require("./routes/hot.routes");
console.log("✅ hot.routes 加载完成");

const app = express();

// ===== CORS =====
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ===== 健康检查 =====
app.get("/api/health", (_req: any, res: any) => {
  res.json({
    status: "ok",
    message: "Health check",
  });
});

// ===== 挂载路由 =====
app.use("/api/auth", authRouter);
app.use("/api/hot", hotRoutes);

// ===== 404 =====
app.use((_req: any, res: any) => {
  res.status(404).json({
    error: "Not found",
  });
});

// ===== 全局错误处理 =====
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("❌ 全局错误:", err);
  res.status(500).json({
    error: err.message,
  });
});

// ===== 关键：启动服务器！ =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Auth:   http://localhost:${PORT}/api/auth`);
  console.log(`   Hot:    http://localhost:${PORT}/api/hot`);
});

module.exports = app;