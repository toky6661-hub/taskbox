<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'

const newName = ref('')
const newUrl = ref('')
const showAddWebsite = ref(false)

// 路由切换时强制关闭弹窗，防止遮罩残留
onBeforeUnmount(() => {
  showAddWebsite.value = false
})

const openAddWebsite = () => {
  showAddWebsite.value = true
}

const addWebsite = () => {
  const name = newName.value.trim()
  const url = newUrl.value.trim()
  if (!name || !url) return
  const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`
  const latestGroup = websiteGroups.value[websiteGroups.value.length - 1] || { title: '自定义网站', links: [] }
  latestGroup.links.push({ name, url: normalizedUrl })
  websiteGroups.value = [...websiteGroups.value.slice(0, -1), latestGroup]
  localStorage.setItem('websiteGroups', JSON.stringify(websiteGroups.value))
  newName.value = ''
  newUrl.value = ''
  showAddWebsite.value = false
}

const defaultGroups = [
  {
    title: "常用网站",
    links: [
      { name: "哔哩哔哩", url: "https://www.bilibili.com/" },
      { name: "乐赏游戏空间", url: "https://qhgame.ysupan.com/" }
    ]
  }
]

const websiteGroups = ref(
  JSON.parse(localStorage.getItem('websiteGroups') || JSON.stringify(defaultGroups))
)

const getFavicon = (url: string): string => {
  try {
    const hostname = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`
  } catch {
    return ''
  }
}

const openWebsite = (url: string): void => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

const closeAddWebsite = () => {
  showAddWebsite.value = false
}
</script>

<template>
  <div class="quick-container">
    <div class="quick-header">
      <h2>快捷入口</h2>
      <button class="add-btn" @click="openAddWebsite">+ 添加网站</button>
    </div>

    <!-- 弹窗 -->
    <Transition name="fade">
      <div v-if="showAddWebsite" class="dialog-mask" @click="closeAddWebsite">
        <div class="add-website-dialog" @click.stop>
          <div class="dialog-header">
            <div>
              <div class="dialog-title">添加网站</div>
              <div class="dialog-subtitle">添加一个新的快捷网站</div>
            </div>
            <button type="button" class="dialog-close" @click="closeAddWebsite">✕</button>
          </div>

          <div class="dialog-body">
            <div class="form-group">
              <label for="site-name">
                <span class="label-icon">📌</span>
                网站名称
              </label>
              <input
                id="site-name"
                v-model="newName"
                type="text"
                placeholder="例如：GitHub"
                autofocus
                @keydown.enter="addWebsite"
              />
            </div>

            <div class="form-group">
              <label for="site-url">
                <span class="label-icon">🔗</span>
                网站地址
              </label>
              <input
                id="site-url"
                v-model="newUrl"
                type="url"
                placeholder="例如：https://github.com"
                @keydown.enter="addWebsite"
              />
            </div>
          </div>

          <div class="dialog-footer">
            <button class="btn btn-cancel" @click="closeAddWebsite">取消</button>
            <button class="btn btn-confirm" @click="addWebsite">
              <span>✓</span> 确定
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 网站卡片网格 -->
    <div class="website-grid">
      <div v-for="group in websiteGroups" :key="group.title">
        <div
          v-for="item in group.links"
          :key="item.name"
          class="website-card"
          @click="openWebsite(item.url)"
        >
          <img :src="getFavicon(item.url)" class="favicon" />
          <span>{{ item.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== 容器 ===== */
.quick-container {
  width: 100%;
}

/* ===== 头部 ===== */
.quick-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
}
.quick-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.add-btn {
  padding: 8px 20px;
  border-radius: 999px;
  border: none;
  background: rgba(255, 255, 255, 0.12);
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: 0.25s;
  white-space: nowrap;
  flex-shrink: 0;
  backdrop-filter: blur(4px);
}
.add-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

/* ===== 遮罩 ===== */
.dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

/* ===== 弹窗主体 ===== */
.add-website-dialog {
  width: 420px;
  max-width: calc(100vw - 40px);
  padding: 0;
  background: rgba(30, 30, 38, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
  color: white;
  overflow: hidden;
}

/* ===== 头部 ===== */
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 28px 0 28px;
}
.dialog-title {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.dialog-subtitle {
  margin-top: 6px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
}
.dialog-close {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dialog-close:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

/* ===== 表单 ===== */
.dialog-body {
  padding: 20px 28px 0 28px;
}
.form-group {
  margin-bottom: 18px;
}
.form-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.75);
}
.form-group .label-icon {
  font-size: 16px;
}
.form-group input {
  width: 100%;
  height: 44px;
  padding: 0 16px;
  box-sizing: border-box;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: white;
  font-size: 15px;
  outline: none;
  transition: 0.2s;
}
.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}
.form-group input:focus {
  border-color: rgba(59, 130, 246, 0.6);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* ===== 底部按钮 ===== */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px 24px 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.btn {
  height: 40px;
  padding: 0 24px;
  border-radius: 999px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
}
.btn-cancel {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.6);
}
.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}
.btn-confirm {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.35);
}
.btn-confirm:active {
  transform: scale(0.96);
}
.btn-confirm span {
  font-size: 16px;
}

/* ===== 过渡动画 ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-active .add-website-dialog,
.fade-leave-active .add-website-dialog {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.fade-enter-from .add-website-dialog,
.fade-leave-to .add-website-dialog {
  transform: scale(0.95);
  opacity: 0;
}

/* ===== 网站卡片网格 ===== */
.website-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 20px;
}
.website-card {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  cursor: pointer;
  transition: 0.25s ease;
}
.website-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}
.favicon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin-bottom: 12px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.05);
}
.website-card span {
  color: white;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  line-height: 1.4;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

/* ===== 响应式 ===== */
@media (max-width: 480px) {
  .add-website-dialog {
    border-radius: 16px;
  }
  .dialog-header {
    padding: 20px 20px 0 20px;
  }
  .dialog-body {
    padding: 16px 20px 0 20px;
  }
  .dialog-footer {
    padding: 16px 20px 20px 20px;
  }
  .dialog-title {
    font-size: 19px;
  }
  .form-group input {
    height: 40px;
    font-size: 14px;
  }
}
</style>