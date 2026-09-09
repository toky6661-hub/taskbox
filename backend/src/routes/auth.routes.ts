// src/routes/auth.routes.ts
console.log('🚀 auth.routes.ts 被加载了！');
const path = require("path");
const authController = path.join(__dirname, "../controllers/auth.controller.ts");
const express = require("express");
const { register, login, getCurrentUser, authenticateToken } = require(authController); // 路径修正

const router = express.Router();

console.log('已注册的路由:');
interface RouteMethods {
  [method: string]: boolean;
}

interface RouteInfo {
  methods: RouteMethods;
  path: string;
}

interface RouterLayer {
  route?: RouteInfo;
}

console.log('register function:', register);
console.log('login function:', login);

//拿到返回的token
router.get("/me", authenticateToken, getCurrentUser);

/*router.get('/me', (_req: any, res: any) =>{
  console.log('.../me 被访问');
  res.json({
    message: true,
    data: {
      "user":{
        "id": 1,
        "username": "testuser",
        "email": "test@example.com"
      }
    }
  })
})*/

//健康
router.get('/health', (_req: any, res: any) => {
  console.log('.../health 被访问');
  res.json({message: true})
})

// GET 测试
router.get('/ping', (_req: any, res: any) => {
  console.log('✅ /ping 被访问');
  res.json({ ok: true });
});

// POST 测试
router.post('/post-test', (_req: any, res: any) => {
  console.log('✅ POST /post-test 被访问');
  res.json({ message: 'POST works!' });
});

// 实际路由
router.post('/register', register);
router.post('/login', login);

router.stack.forEach((layer: RouterLayer) => {
  if (layer.route) {
    console.log(`  ${Object.keys(layer.route.methods).join(', ').toUpperCase()} ${layer.route.path}`);
  }
});

console.log('🔍 当前 router.stack 内容：');
router.stack.forEach((layer: RouterLayer, index: number) => {
  console.log(`  [${index}]`, layer);
});



// 测试路由
/*router.get('/test', (_req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Auth router is working!'
  });
});

// 健康检查
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Auth router is healthy!'
  });
});*/

/*router.get('/post-test', (_req: any, res: any) => {
  res.json({
    status: 'success',
    message: 'pong'
  });
});*/

// 注册
/*router.post('/register', (req: Request, res: Response) => {
  const { register } = require('../controllers/auth.controller');
  register(req, res);
});

// 登录
router.post('/login', (req: Request, res: Response) => {
  const { login } = require('../controllers/auth.controller');
  login(req, res);
});*/


module.exports = router;