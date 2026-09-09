"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Express is provided by the backend runtime; suppress type resolution when
// the frontend TypeScript project does not include backend dependencies.
// @ts-ignore
const express = require("express");
// @ts-ignore
const cors = require("cors");
// @ts-ignore
const authRouter = require("./routes/auth.routes").default || require("./routes/auth.routes");
const hotRoutes = require('./routes/hot.routes');
//测试打印
/*console.log('📦 authRouter 类型:', typeof authRouter);
console.log('📦 authRouter 是否函数?', typeof authRouter === 'function');
console.log('📦 authRouter 是否包含 stack?', !!authRouter?.stack);
console.log('📦 authRouter 的 stack 长度:', authRouter?.stack?.length);*/
const app = express();
//响应中间件
/*app.use((_req: any, res: any, next: any) => {
  console.log('🔥 app.ts 全局中间件被触发');
  res.send('中间件拦截');
  // 注意：不调用 next()
});

//全局相应日志中间件
app.use((req: any, res: any, next: any) => {
  console.log('🔥 全局请求捕获:', req.method, req.url);
  // 不要调用 next()，直接返回响应，测试是否能拦截
  res.send('Global interceptor');
});

//全局请求日志中间件
app.use((req: any, _res: any, next: any) => {
  console.log(`🌐 全局请求: ${req.method} ${req.url}`);
  next();
});

//临时测试路由
app.post('/test-post-direct', (_req: unknown, res: { json: (arg0: { message: string }) => void }) => {
  res.json({ message: 'Direct POST works!' });
});*/
app.use(cors());
app.use(express.json());
app.use("/api/hot", hotRoutes);
app.use("/api/auth", authRouter);
app.get("/api/health", (_req, res) => {
    res.json({
        status: "success",
        message: "Hello, API IS RUNNING!"
    });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
module.exports = app;
//# sourceMappingURL=app.js.map