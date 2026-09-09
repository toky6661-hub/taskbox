import type { NextFunction, Request, Response } from "express";
const jwt = require("jsonwebtoken");

interface AuthenticatedRequest extends Request {
  userId: number;
}

interface JwtUser {
  userId: number;
}

function authenticateToken(
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
) {

  const authorization = req.get("authorization");
  const [type, token] = authorization?.split(" ") ?? [];

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ 
      success: false,
      message: authorization ? "Authorization 格式错误" : "未提供访问令牌"
    });
  }

  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error(
        "JWT_SECRET is not defined in the environment variables."
    );
  }

  try {
    jwt.verify(token, secretKey, (err: Error | null, user: JwtUser) => {
      if (err) {
        return res.status(403).json({ 
          success: false,
          message: "令牌无效" 
        });
      }
      req.userId = user.userId;
      next();
    });
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: "令牌验证失败"
    });
  }
}

module.exports = { authenticateToken };

