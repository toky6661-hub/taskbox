// frontend/vite.config.ts

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  // 部署到 Vercel 根域名，如果是子路径需要修改
  base: '/',

  plugins: [
    vue()
  ],

  // ===== 本地开发服务器配置 =====
  server: {
    port: 5173,
    host: '0.0.0.0', // 允许局域网访问（可选）
    
    // ===== API 代理（解决本地跨域 + 502） =====
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // 后端地址
        changeOrigin: true,               // 修改请求头中的 origin
        secure: false,                    // 允许 HTTPS 自签名证书
        rewrite: (path) => path,          // 保持路径不变，即 /api/xxx → /api/xxx
        // 如果后端需要去掉 /api 前缀，改用：
        // rewrite: (path) => path.replace(/^\/api/, '')
        configure: (proxy, options) => {
          // 可选：代理日志调试
          proxy.on('error', (err) => {
            console.log('[Vite Proxy] 代理错误:', err.message)
          })
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log(`[Vite Proxy] ${req.method} ${req.url} → ${options.target}${req.url}`)
          })
        }
      }
    }
  },

  // ===== 生产构建配置 =====
  build: {
    outDir: 'dist',               // 构建输出目录
    sourcemap: false,             // 生产环境不生成 sourcemap（减小体积）
    minify: 'esbuild',            // 使用 esbuild 压缩（速度快）
    rollupOptions: {
      output: {
        // 分块策略，优化加载性能
        manualChunks: (id) => {
          if (id.includes('node_modules/vue') ||
              id.includes('node_modules/vue-router') ||
              id.includes('node_modules/pinia')) {
            return 'vendor'
          }
        }
      }
    }
  },

  // ===== 环境变量加载 =====
  envPrefix: 'VITE_',             // 只暴露以 VITE_ 开头的环境变量给客户端
})