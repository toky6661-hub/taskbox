// src/server.js

const app = require("./app.js");

// 本地开发时监听端口（Vercel 线上不会执行这段）
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Vercel Services 模式：直接导出 Express app
module.exports = app;