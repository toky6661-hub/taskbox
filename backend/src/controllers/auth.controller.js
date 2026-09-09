"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
function generateToken(userId) {
    const secretKey = process.env.JWT_SECRET || "default_secret_key"; // Use a default secret key if not provided
    const expiresIn = (process.env.JWT_EXPIRES_IN || "7d");
    if (!secretKey) {
        throw new Error("JWT_SECRET is not defined in the environment variables.");
    }
    return jwt.sign({ userId }, secretKey, {
        expiresIn // Use a default expiration time if not provided
    });
}
async function register(req, res) {
    console.log('📌 register 被调用，pool 是:', pool);
    console.log('📌 pool.query 是否存在?', typeof pool?.query);
    try {
        const { username, password, email } = req.body;
        if (!username || !password || !email) {
            return res.status(400).json({
                success: false,
                message: "用户名、邮箱和密码不能为空"
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "密码必须在6个字符以上"
            });
        }
        if (username.length < 1) {
            return res.status(400).json({
                success: false,
                message: "用户名必须在1个字符以上"
            });
        }
        const [existingUser] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
        if (Array.isArray(existingUser) && existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: "用户名已存在"
            });
        }
        //邮箱重复验证
        const [existingEmail] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (Array.isArray(existingEmail) && existingEmail.length > 0) {
            return res.status(400).json({
                success: false,
                message: "邮箱已被注册"
            });
        }
        const passwordHash = await bcryptjs.hash(password, 10);
        const [result] = await pool.query('INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)', [username, passwordHash, email]);
        const token = generateToken(result.insertId);
        return res.status(201).json({
            success: true,
            message: "用户注册成功",
            data: {
                token,
                user: {
                    id: result.insertId,
                    username,
                    email
                },
            },
        });
    }
    catch (error) {
        console.error("Error during user registration:", error);
        return res.status(500).json({
            success: false,
            message: "服务器错误，请稍后再试"
        });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "邮箱和密码不能为空"
            });
        }
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        console.log('🔍 查询到的用户数据:', rows[0]);
        console.log('🔍 查询结果 rows:', rows);
        if (rows && rows.length > 0) {
            console.log('🔍 用户对象 keys:', Object.keys(rows[0]));
        }
        if (Array.isArray(rows) && rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "用户不存在"
            });
        }
        const user = rows[0];
        const isMatch = await bcryptjs.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "密码错误"
            });
        }
        const token = generateToken(user.id);
        return res.status(200).json({
            success: true,
            message: "登录成功",
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                },
            },
        });
    }
    catch (error) {
        console.error("Error during user login:", error);
        return res.status(500).json({
            success: false,
            message: "服务器错误，请稍后再试"
        });
    }
}
async function getCurrentUser(_req, _res) {
    try {
        const userId = _req.userId;
        console.log("/me 收到的 req.uer:", _req.user);
        console.log("/me 获取到的 userId:", userId);
        if (!userId) {
            return _res.status(401).json({
                success: false,
                message: "未授权访问"
            });
        }
        const [rows] = await pool.query("SELECT id, username, email FROM users WHERE id = ?", [userId]);
        if (!Array.isArray(rows) || rows.length === 0) {
            return _res.status(404).json({
                success: false,
                message: "用户不存在"
            });
        }
        const user = rows[0];
        return _res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            }
        });
    }
    catch (error) {
        console.error("Error fetching current user:", error);
        return _res.status(500).json({
            success: false,
            message: "服务器错误，请稍后再试"
        });
    }
}
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "未授权访问"
        });
    }
    try {
        const secretKey = process.env.JWT_SECRET || "default_secret_key";
        const decoded = jwt.verify(token, secretKey);
        if (!decoded || typeof decoded !== "object" || !decoded.userId) {
            return res.status(401).json({
                success: false,
                message: "无效令牌"
            });
        }
        req.userId = decoded.userId;
        req.user = decoded;
        return next();
    }
    catch (error) {
        console.error("JWT verification failed:", error);
        return res.status(401).json({
            success: false,
            message: "令牌已失效或无效"
        });
    }
}
module.exports = { register, login, getCurrentUser, authenticateToken };
//# sourceMappingURL=auth.controller.js.map