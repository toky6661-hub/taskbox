<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const showMenu = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const closeMenu = () => {
  showMenu.value = false
}

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    userStore.logout()
  }
  closeMenu()
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-menu-wrapper')) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header>
    <div class="search-wrap">
      <label for="search-input" class="sr-only">搜索</label>
      <div class="search-input-wrapper">
        <span class="search-icon" aria-hidden="true">🔍</span>
        <input
          id="search-input"
          placeholder="搜索功能、文件、文章..."
          class="search-input"
        />
      </div>
    </div>

    <div class="right-group">
      <div class="user-menu-wrapper">
        <span class="username">{{ userStore.user?.username || '用户' }}</span>
        <div class="avatar" @click="toggleMenu">
          {{ userStore.user?.username?.charAt(0) || '👤' }}
        </div>

        <transition name="fade">
          <div v-if="showMenu" class="dropdown-menu">
            <div class="menu-item" @click="router.push('/profile'); closeMenu()">
              <span class="menu-icon">👤</span>
              <span>个人信息</span>
            </div>
            <div class="menu-item" @click="router.push('/settings'); closeMenu()">
              <span class="menu-icon">⚙️</span>
              <span>设置</span>
            </div>
            <div class="menu-divider"></div>
            <div class="menu-item logout" @click="handleLogout">
              <span class="menu-icon">🚪</span>
              <span>退出登录</span>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* ===== 辅助类 ===== */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* ===== Header 主体 ===== */
header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  background: rgba(0, 0, 0, 0.2);        /* 半透明，透出壁纸 */
  backdrop-filter: blur(12px) saturate(1.2);
  -webkit-backdrop-filter: blur(12px) saturate(1.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
  transition: background 0.3s;
}

/* ===== 搜索框 ===== */
.search-wrap {
  flex: 1;
  max-width: 500px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 0 16px;
  transition: all 0.3s ease;
}

.search-input-wrapper:focus-within {
  background: rgba(255, 255, 255, 0.10);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
}

.search-icon {
  font-size: 18px;
  opacity: 0.4;
  margin-right: 10px;
  transition: opacity 0.3s;
}

.search-input-wrapper:focus-within .search-icon {
  opacity: 0.8;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 10px 0;
  color: white;
  font-size: 14px;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

/* ===== 右侧用户区域 ===== */
.right-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-menu-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: default;
}

.username {
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: color 0.2s;
}

.username:hover {
  color: white;
}

/* ===== 头像 ===== */
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3));
  border: 2px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  user-select: none;
  transition: all 0.25s ease;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.05);
}

.avatar:hover {
  transform: scale(1.08);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.15);
}

.avatar:active {
  transform: scale(0.95);
}

/* ===== 下拉菜单 ===== */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  min-width: 190px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(20px) saturate(1.2);
  -webkit-backdrop-filter: blur(20px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 6px 0;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border-radius: 0;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.menu-item.logout:hover {
  background: rgba(255, 80, 80, 0.15);
  color: #ff6b6b;
}

.menu-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.menu-divider {
  height: 1px;
  margin: 4px 12px;
  background: rgba(255, 255, 255, 0.06);
}

/* ===== 下拉动画 ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  header {
    padding: 0 16px;
    height: 56px;
  }

  .search-wrap {
    max-width: none;
    flex: 1;
    margin-right: 12px;
  }

  .search-input {
    padding: 8px 0;
    font-size: 13px;
  }

  .username {
    font-size: 13px;
  }

  .avatar {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .dropdown-menu {
    right: -8px;
    min-width: 170px;
  }
}
</style>