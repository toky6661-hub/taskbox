<template>
  <div class="login-page">
    <!-- 背景壁纸复用 Wallpaper 组件 -->
    <Wallpaper />

    <div class="login-container">
      <!-- 卡片 -->
      <div class="login-card">
        <!-- Logo / 标题 -->
        <div class="brand">
          <span class="logo-icon">📁</span>
          <h1>WorkBox</h1>
        </div>

        <!-- Tab 切换 -->
        <div class="tabs">
          <button
            class="tab"
            :class="{ active: isLogin }"
            @click="isLogin = true"
          >
            登录
          </button>
          <button
            class="tab"
            :class="{ active: !isLogin }"
            @click="isLogin = false"
          >
            注册
          </button>
        </div>

        <!-- 登录表单 -->
        <form v-if="isLogin" @submit.prevent="handleLogin" class="form">
          <div class="form-group">
            <label for="login-email">邮箱</label>
            <input
              id="login-email"
              v-model="loginForm.email"
              type="email"
              placeholder="请输入邮箱"
              required
            />
          </div>
          <div class="form-group">
            <label for="login-password">密码</label>
            <div class="password-wrapper">
              <input
                id="login-password"
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                required
              />
              <button
                type="button"
                class="toggle-pwd"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>
          <div v-if="loginError" class="error-msg">{{ loginError }}</div>
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <!-- 注册表单 -->
        <form v-else @submit.prevent="handleRegister" class="form">
          <div class="form-group">
            <label for="reg-username">用户名</label>
            <input
              id="reg-username"
              v-model="registerForm.username"
              type="text"
              placeholder="请输入用户名"
              required
            />
          </div>
          <div class="form-group">
            <label for="reg-email">邮箱</label>
            <input
              id="reg-email"
              v-model="registerForm.email"
              type="email"
              placeholder="请输入邮箱"
              required
            />
          </div>
          <div class="form-group">
            <label for="reg-password">密码</label>
            <div class="password-wrapper">
              <input
                id="reg-password"
                v-model="registerForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请设置密码（至少6位）"
                required
                minlength="6"
              />
              <button
                type="button"
                class="toggle-pwd"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>
          <div v-if="registerError" class="error-msg">{{ registerError }}</div>
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </form>

        <div class="footer-note">
          {{ isLogin ? '还没有账号？' : '已有账号？' }}
          <button class="switch-btn" @click="isLogin = !isLogin">
            {{ isLogin ? '立即注册' : '去登录' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import Wallpaper from '../components/Wallpaper.vue'

// ===== 安全访问 localStorage =====
const storage = typeof window !== 'undefined' ? window.localStorage : null

// ===== API 地址 =====
const API_URL = import.meta.env.VITE_API_URL || ''

const router = useRouter()
const userStore = useUserStore()

const isLogin = ref(true)

const loginForm = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  email: '',
  password: ''
})

const loading = ref(false)
const loginError = ref('')
const registerError = ref('')
const showPassword = ref(false)

// ===== 检查是否已登录 =====
onMounted(() => {
  const token = storage?.getItem('token')
  if (token && userStore.user) {
    router.push('/')
  }
})

// ===== 登录处理 =====
const handleLogin = async () => {
  loginError.value = ''
  loading.value = true

  try {
    const res = await fetch(
      `${API_URL}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password
        })
      }
    )

    const data = await res.json()

    if (!res.ok || !data.success) {
      loginError.value = data.message || '登录失败'
      return
    }

    const { token, user } = data.data

    storage?.setItem('token', token)
    userStore.setUser(user)

    router.push('/')
  } catch (error) {
    loginError.value = '网络错误，请重试'
    console.error('登录错误:', error)
  } finally {
    loading.value = false
  }
}

// ===== 注册处理 =====
const handleRegister = async () => {
  registerError.value = ''
  loading.value = true

  try {
    const res = await fetch(
      `${API_URL}/api/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password
        })
      }
    )

    const data = await res.json()

    if (!res.ok || !data.success) {
      registerError.value = data.message || '注册失败'
      return
    }

    // 注册成功后切换到登录
    isLogin.value = true
    loginForm.email = registerForm.email
    registerForm.username = ''
    registerForm.email = ''
    registerForm.password = ''
    registerError.value = '注册成功，请登录'
  } catch (error) {
    registerError.value = '网络错误，请重试'
    console.error('注册错误:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10; /* 修复：提高层级，在壁纸之上 */
}

.login-container {
  width: 100%;
  max-width: 420px;
  padding: 20px;
  box-sizing: border-box;
  pointer-events: none; /* 让点击穿透到壁纸，但内部可交互 */
}
.login-container * {
  pointer-events: auto; /* 内部元素恢复点击 */
}

.login-card {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 40px 32px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
}
.brand .logo-icon {
  font-size: 32px;
}
.brand h1 {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0;
  letter-spacing: 1px;
}

.tabs {
  display: flex;
  gap: 0;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 28px;
  background: rgba(255, 255, 255, 0.06);
}
.tab {
  flex: 1;
  padding: 12px 0;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.25s;
}
.tab.active {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}
.tab:hover {
  color: white;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-group label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}
.form-group input {
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: white;
  font-size: 15px;
  outline: none;
  transition: 0.2s;
}
.form-group input:focus {
  border-color: rgba(59, 130, 246, 0.6);
  background: rgba(255, 255, 255, 0.1);
}
.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.password-wrapper {
  position: relative;
}
.password-wrapper input {
  width: 100%;
  padding-right: 46px;
}
.toggle-pwd {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  padding: 0;
  color: rgba(255, 255, 255, 0.5);
  transition: 0.2s;
}
.toggle-pwd:hover {
  color: white;
}

.error-msg {
  color: #ff6b6b;
  font-size: 14px;
  background: rgba(255, 80, 80, 0.15);
  padding: 8px 12px;
  border-radius: 8px;
  border-left: 3px solid #ff6b6b;
}

.btn-primary {
  padding: 14px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s;
  margin-top: 8px;
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.35);
}
.btn-primary:active:not(:disabled) {
  transform: scale(0.96);
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.footer-note {
  margin-top: 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}
.switch-btn {
  background: transparent;
  border: none;
  color: #3b82f6;
  font-weight: 500;
  cursor: pointer;
  padding: 0 4px;
  transition: 0.2s;
}
.switch-btn:hover {
  color: #60a5fa;
  text-decoration: underline;
}
</style>