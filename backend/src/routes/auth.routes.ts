// src/routes/auth.routes.ts

const express = require("express");

const {
  register,
  login,
  getCurrentUser,
  authenticateToken,
} = require("../controllers/auth.controller");

const router = express.Router();

// 获取当前用户
router.get("/me", authenticateToken, getCurrentUser);

// 健康检查
router.get("/health", (_req: any, res: any) => {
  res.json({
    message: true,
  });
});

// GET 测试
router.get("/ping", (_req: any, res: any) => {
  res.json({
    ok: true,
  });
});

// POST 测试
router.post("/post-test", (_req: any, res: any) => {
  res.json({
    message: "POST works!",
  });
});

// 注册
router.post("/register", register);

// 登录
router.post("/login", login);

module.exports = router;