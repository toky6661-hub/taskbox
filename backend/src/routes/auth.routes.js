"use strict";
// src/routes/auth.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const { register, login, getCurrentUser, authenticateToken, } = require("../controllers/auth.controller");
const router = express.Router();
// 获取当前用户
router.get("/me", authenticateToken, getCurrentUser);
// 健康检查
router.get("/health", (_req, res) => {
    res.json({
        message: true,
    });
});
// GET 测试
router.get("/ping", (_req, res) => {
    res.json({
        ok: true,
    });
});
// POST 测试
router.post("/post-test", (_req, res) => {
    res.json({
        message: "POST works!",
    });
});
// 注册
router.post("/register", register);
// 登录
router.post("/login", login);
module.exports = router;
//# sourceMappingURL=auth.routes.js.map