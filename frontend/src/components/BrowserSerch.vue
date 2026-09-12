<template>
  <div class="browser-search">
    <!-- ===== 快捷导航 ===== -->
    <div class="quick-nav">
      <a
        v-for="link in quickLinks"
        :key="link.name"
        :href="link.url"
        target="_blank"
        class="nav-link"
        rel="noopener noreferrer"
        :title="link.name"
      >
        <img
          v-if="link.icon"
          :src="link.icon"
          :alt="link.name"
          class="nav-icon"
          loading="lazy"
        />
        <span v-else class="nav-icon-placeholder">{{ link.name.charAt(0) }}</span>
        <span class="nav-name">{{ link.name }}</span>
      </a>
      <button class="nav-link add-link" @click="showAddDialog = true" title="添加常用网站">
        <span class="nav-icon-placeholder">+</span>
        <span class="nav-name">添加</span>
      </button>
    </div>

    <!-- ===== 搜索框 ===== -->
    <div class="search-wrapper">
      <div class="search-box">
        <span class="search-engine" aria-hidden="true">{{ currentEngine.icon }}</span>
        <label for="browser-search-input" class="sr-only">搜索框</label>
        <input
          id="browser-search-input"
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          :placeholder="`使用 ${currentEngine.name} 搜索...`"
          @keydown.enter="handleSearch"
          autocomplete="off"
          spellcheck="false"
        />
        <button class="search-go" @click="handleSearch" title="搜索">搜索</button>
      </div>

      <!-- 搜索引擎切换 -->
      <div class="engine-tabs" role="tablist" aria-label="搜索引擎切换">
        <button
          v-for="engine in engines"
          :key="engine.name"
          class="engine-btn"
          :class="{ active: currentEngine.name === engine.name }"
          @click="switchEngine(engine)"
          role="tab"
          :aria-selected="currentEngine.name === engine.name"
          :title="`切换到 ${engine.name} 搜索`"
        >
          <span class="engine-icon" aria-hidden="true">{{ engine.icon }}</span>
          <span>{{ engine.name }}</span>
        </button>
      </div>

      <!-- 搜索提示 -->
      <div class="search-hint">
        <span>按 Enter 搜索</span>
        <span class="hint-sep">|</span>
        <span>使用 {{ currentEngine.name }} 搜索</span>
      </div>

      <!-- ===== 热点资讯 ===== -->
      <div v-if="hotList.length > 0" class="hot-panel">
        <div class="hot-header">
          <span class="hot-icon" aria-hidden="true">🔥</span>
          <span class="hot-title">今日热点</span>
          <button class="hot-update" @click="fetchHotList" :disabled="hotLoading">
            <span v-if="hotLoading">⏳</span>
            <span v-else>↻</span>
            刷新
          </button>
        </div>
        <div class="hot-list" role="list">
          <div
            v-for="(item, index) in hotList"
            :key="index"
            class="hot-item"
            @click="searchHot(item)"
            role="listitem"
            :title="`搜索：${item.title}`"
          >
            <span class="hot-rank" :class="getRankClass(index)" aria-hidden="true">
              {{ index + 1 }}
            </span>
            <span class="hot-text">{{ item.title }}</span>
            <span v-if="item.hot" class="hot-value">{{ item.hot }}</span>
          </div>
        </div>
      </div>
      <div v-else-if="hotLoading" class="hot-loading">
        <span>⏳ 加载热点中...</span>
      </div>
      <div v-else-if="hotError" class="hot-error" @click="fetchHotList" role="button">
        <span>⚠️ 加载失败，点击重试</span>
      </div>
      <div v-else class="hot-empty">暂无热点</div>
    </div>

    <!-- ===== 添加网站弹窗 ===== -->
    <div v-if="showAddDialog" class="dialog-mask" @click="showAddDialog = false">
      <div class="dialog-content" @click.stop role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <h3 id="dialog-title">添加常用网站</h3>

        <div class="form-group">
          <label for="add-site-name" class="sr-only">网站名称</label>
          <input id="add-site-name" v-model="newName" placeholder="网站名称" @keydown.enter="addLink" />
        </div>

        <div class="form-group">
          <label for="add-site-url" class="sr-only">网站地址</label>
          <input id="add-site-url" v-model="newUrl" placeholder="网址 (https://...)" @keydown.enter="addLink" />
        </div>

        <div class="form-group">
          <label for="add-site-icon" class="sr-only">图标 URL（可选）</label>
          <input id="add-site-icon" v-model="newIcon" placeholder="图标 URL（可选）" @keydown.enter="addLink" />
        </div>

        <div class="dialog-actions">
          <button class="btn-cancel" @click="showAddDialog = false">取消</button>
          <button class="btn-confirm" @click="addLink">添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Link {
  name: string
  url: string
  icon?: string
}

interface Engine {
  name: string
  icon: string
  url: string
}

interface HotItem {
  title: string
  hot?: string
  url?: string
}

// ===== 默认链接 =====
const defaultLinks: Link[] = [
  { name: '哔哩哔哩', url: 'https://www.bilibili.com/', icon: 'https://www.bilibili.com/favicon.ico' },
  { name: 'GitHub', url: 'https://github.com/', icon: 'https://github.com/favicon.ico' },
  { name: '百度', url: 'https://www.baidu.com/', icon: 'https://www.baidu.com/favicon.ico' },
]

// ===== 搜索引擎 =====
const engines: Engine[] = [
  { name: '百度', icon: '🌐', url: 'https://www.baidu.com/s?wd=' },
  { name: 'Google', icon: '🇬', url: 'https://www.google.com/search?q=' },
  { name: 'Bing', icon: '🔵', url: 'https://www.bing.com/search?q=' },
]

// ===== 状态 =====
const quickLinks = ref<Link[]>([])
const searchQuery = ref('')
const currentEngine = ref<Engine>(engines[0])
const showAddDialog = ref(false)
const newName = ref('')
const newUrl = ref('')
const newIcon = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

const hotList = ref<HotItem[]>([])
const hotLoading = ref(false)
const hotError = ref(false)

// ===== 备用热点数据 =====
const fallbackHotList: HotItem[] = [
  { title: '神舟十七号成功着陆', hot: '892万' },
  { title: '五一假期火车票开售', hot: '763万' },
  { title: '华为Pura 70系列发布', hot: '654万' },
  { title: '特斯拉宣布全球裁员10%', hot: '521万' },
  { title: '巴黎奥运会倒计时100天', hot: '487万' },
  { title: 'AI大模型掀起价格战', hot: '396万' },
  { title: '我国超长期特别国债即将发行', hot: '312万' },
  { title: '广州暴雨引发内涝', hot: '278万' },
]

// ===== 获取热点数据 =====
const fetchHotList = async () => {
  if (hotLoading.value) return

  hotLoading.value = true
  hotError.value = false

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    // 改回相对路径，让 Vercel 的 vercel.json 重写规则去转发请求
    const res = await fetch('/api/hot/list', {
      signal: controller.signal,
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    })

    clearTimeout(timeoutId)

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()
    if (data.code === 200 && Array.isArray(data.data) && data.data.length > 0) {
      hotList.value = data.data.slice(0, 10)
      localStorage.setItem('hotCache', JSON.stringify({
        data: hotList.value,
        time: Date.now()
      }))
      hotError.value = false
    } else {
      throw new Error('数据格式错误或为空')
    }
  } catch (error) {
    console.warn('热点请求失败，尝试缓存或模拟数据', error)

    const cached = localStorage.getItem('hotCache')
    if (cached) {
      try {
        const cacheData = JSON.parse(cached)
        if (cacheData.time && Date.now() - cacheData.time < 24 * 60 * 60 * 1000) {
          hotList.value = cacheData.data
          hotError.value = false
          hotLoading.value = false
          return
        }
      } catch {}
    }

    hotList.value = fallbackHotList
    localStorage.setItem('hotCache', JSON.stringify({
      data: fallbackHotList,
      time: Date.now()
    }))
    hotError.value = false
  } finally {
    hotLoading.value = false
  }
}

// ===== 点击热点词搜索 =====
const searchHot = (item: HotItem) => {
  if (item.title) {
    searchQuery.value = item.title
    handleSearch()
  }
}

// ===== 排名样式 =====
const getRankClass = (index: number) => {
  if (index === 0) return 'rank-1'
  if (index === 1) return 'rank-2'
  if (index === 2) return 'rank-3'
  return ''
}

// ===== 切换搜索引擎 =====
const switchEngine = (engine: Engine) => {
  currentEngine.value = engine
  localStorage.setItem('searchEngine', engine.name)
  setTimeout(() => searchInput.value?.focus(), 50)
}

// ===== 添加链接 =====
const addLink = () => {
  const name = newName.value.trim()
  const url = newUrl.value.trim()
  if (!name || !url) return
  const icon = newIcon.value.trim() || undefined
  quickLinks.value.push({ name, url, icon })
  localStorage.setItem('quickLinks', JSON.stringify(quickLinks.value))
  newName.value = ''
  newUrl.value = ''
  newIcon.value = ''
  showAddDialog.value = false
}

// ===== 搜索处理 =====
const handleSearch = () => {
  const q = searchQuery.value.trim()
  if (!q) return
  if (/^https?:\/\/.+/.test(q)) {
    window.open(q, '_blank')
    return
  }
  const searchUrl = currentEngine.value.url + encodeURIComponent(q)
  window.open(searchUrl, '_blank')
}

// ===== 初始化 =====
onMounted(() => {
  const saved = localStorage.getItem('quickLinks')
  if (saved) {
    try {
      quickLinks.value = JSON.parse(saved)
    } catch {
      quickLinks.value = [...defaultLinks]
    }
  } else {
    quickLinks.value = [...defaultLinks]
  }

  const savedEngine = localStorage.getItem('searchEngine')
  if (savedEngine) {
    const found = engines.find(e => e.name === savedEngine)
    if (found) currentEngine.value = found
  }

  fetchHotList()
  setTimeout(() => searchInput.value?.focus(), 100)
})
</script>

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
  white-space: nowrap;
}

.browser-search {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0 10px;
}

/* ===== 快捷导航 ===== */
.quick-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  margin-bottom: 30px;
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: 0.25s ease;
  cursor: pointer;
  min-width: 60px;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
  border-color: rgba(255, 255, 255, 0.1);
}

.nav-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  object-fit: contain;
}

.nav-icon-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
}

.nav-name {
  font-size: 12px;
  opacity: 0.7;
  white-space: nowrap;
  max-width: 64px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-link .nav-icon-placeholder {
  border: 1px dashed rgba(255, 255, 255, 0.2);
  background: transparent;
  font-size: 20px;
}

/* ===== 搜索框 ===== */
.search-wrapper {
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.search-box {
  width: 100%;
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 8px 12px 8px 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: border-color 0.3s, box-shadow 0.3s;
}

.search-box:focus-within {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
}

.search-engine {
  font-size: 22px;
  margin-right: 10px;
  opacity: 0.8;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 0;
  color: white;
  font-size: 16px;
  outline: none;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.search-go {
  padding: 8px 20px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
  white-space: nowrap;
}

.search-go:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

/* ===== 搜索引擎切换 ===== */
.engine-tabs {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
}

.engine-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: 0.25s;
  font-size: 14px;
  backdrop-filter: blur(4px);
}

.engine-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.engine-btn.active {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.4);
  color: #3b82f6;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);
}

.engine-icon {
  font-size: 18px;
}

.search-hint {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.3);
}

.hint-sep {
  opacity: 0.3;
}

/* ===== 热点面板 ===== */
.hot-panel {
  width: 100%;
  margin-top: 8px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  padding: 16px 18px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.hot-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.hot-icon {
  font-size: 18px;
}

.hot-title {
  font-weight: 600;
  color: white;
}

.hot-update {
  margin-left: auto;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
  transition: 0.2s;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;
}

.hot-update:hover:not(:disabled) {
  color: white;
}

.hot-update:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hot-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hot-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  color: rgba(255, 255, 255, 0.85);
}

.hot-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.hot-rank {
  font-size: 13px;
  font-weight: 600;
  min-width: 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
}

.hot-rank.rank-1 {
  color: #ff6b6b;
}
.hot-rank.rank-2 {
  color: #ffa94d;
}
.hot-rank.rank-3 {
  color: #ffd93d;
}

.hot-text {
  flex: 1;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hot-value {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  white-space: nowrap;
}

.hot-loading,
.hot-empty,
.hot-error {
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
  padding: 12px 0;
  text-align: center;
}

.hot-error {
  cursor: pointer;
  color: #ff6b6b;
}
.hot-error:hover {
  text-decoration: underline;
}

/* ===== 弹窗 ===== */
.dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  width: 380px;
  max-width: calc(100vw - 40px);
  padding: 28px;
  border-radius: 24px;
  background: rgba(30, 30, 38, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  color: white;
}

.dialog-content h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
  text-align: center;
}

.dialog-content .form-group {
  margin-bottom: 12px;
}

.dialog-content input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: white;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.dialog-content input:focus {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(255, 255, 255, 0.1);
}

.dialog-content input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
}

.dialog-actions button {
  padding: 10px 24px;
  border-radius: 999px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
}
.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.btn-confirm {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
}
.btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}
</style>