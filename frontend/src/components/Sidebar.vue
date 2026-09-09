<template>
  <aside class="sidebar">
    <div class="logo">
      <span class="logo-icon">📁</span>
      <span class="logo-text">WorkBox</span>
    </div>

    <nav class="nav">
      <router-link to="/" class="nav-item" active-class="active">
        <span class="nav-icon">🏠</span>
        <span>首页</span>
      </router-link>
      <router-link to="/notes" class="nav-item" active-class="active">
        <span class="nav-icon">📝</span>
        <span>笔记</span>
      </router-link>
      <router-link to="/blog" class="nav-item" active-class="active">
        <span class="nav-icon">📰</span>
        <span>博客</span>
      </router-link>
      <router-link to="/files" class="nav-item" active-class="active">
        <span class="nav-icon">📂</span>
        <span>文件</span>
      </router-link>
      <router-link to="/tools" class="nav-item" active-class="active">
        <span class="nav-icon">🔧</span>
        <span>工具</span>
      </router-link>
      <router-link to="/settings" class="nav-item" active-class="active">
        <span class="nav-icon">⚙️</span>
        <span>设置</span>
      </router-link>
    </nav>

    <!-- 退出登录按钮 -->
    <div class="logout-wrapper">
      <button class="logout-btn" @click="handleLogout">
        <span class="logout-icon">🚪</span>
        <span>退出登录</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  if (!confirm('确定要退出登录吗？')) return
  localStorage.removeItem('token')
  userStore.setUser(null as unknown as Parameters<typeof userStore.setUser>[0])
  router.push('/login').catch(() => {
    window.location.href = '/login'
  })
}
</script>

<style scoped>
/* ===== 侧边栏主体：毛玻璃 ===== */
.sidebar {
  width: 220px;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);        /* 更透明，露出壁纸 */
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  box-sizing: border-box;
  flex-shrink: 0;
  user-select: none;
  transition: background 0.3s;
}

/* ===== Logo ===== */
.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 24px;
}
.logo-icon {
  font-size: 28px;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
}
.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: white;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

/* ===== 导航列表 ===== */
.nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ===== 导航项 ===== */
.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

/* 悬浮效果：背景高亮 + 轻微上移 */
.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
  transform: translateX(4px);
}

/* 激活状态：左侧彩色指示条 + 文字高亮 */
.nav-item.active {
  background: rgba(59, 130, 246, 0.12);
  color: #3b82f6;
  box-shadow: inset 3px 0 0 #3b82f6;   /* 左侧蓝色竖条 */
}

/* 激活时悬浮效果叠加 */
.nav-item.active:hover {
  background: rgba(59, 130, 246, 0.18);
  transform: translateX(4px);
}

.nav-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

/* ===== 退出按钮 ===== */
.logout-wrapper {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.logout-btn:hover {
  background: rgba(255, 80, 80, 0.15);
  color: #ff6b6b;
  transform: translateX(4px);
}

.logout-btn:active {
  transform: scale(0.96);
}

.logout-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.logout-btn:hover .logout-icon {
  transform: rotate(15deg) scale(1.1);
}
</style>