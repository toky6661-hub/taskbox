// src/server.js

const serverless = require("serverless-http");
const app = require("./app.js");

// 本地开发时直接监听端口
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Vercel 线上通过 serverless-http 导出 handler
module.exports = serverless(app);
module.exports.handler = serverless(app);