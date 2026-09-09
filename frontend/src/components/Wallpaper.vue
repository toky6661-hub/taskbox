<template>
  <!-- ====== 壁纸渲染层 ====== -->
  <div class="wallpaper-layer">
    <video
      v-if="mode === 'video' && !lowPerformance"
      ref="videoRef"
      class="wallpaper-video"
      :style="{ objectFit: fitMode }"
      :src="videoSrc"
      :poster="defaultImage"
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
      @error="onVideoError"
    ></video>

    <img
      v-else-if="mode === 'image' && imageUrl"
      class="wallpaper-img"
      :src="imageUrl"
      :style="{ objectFit: fitMode }"
      alt=""
      draggable="false"
      @error="onImageError"
      @load="onImageLoad"
    />

    <div v-else class="wallpaper-fallback"></div>
    <div class="brightness-overlay" :style="{ opacity: brightness }"></div>
  </div>

  <!-- ====== 控制面板 ====== -->
  <div class="controls-wrapper">
    <button class="dot-trigger" @click="showControls = !showControls" title="壁纸设置">
      <span>⚙️</span>
    </button>

    <div v-if="showControls" class="controls-panel">
      <div class="control-group">
        <label>模式</label>
        <div class="btn-group">
          <button :class="{ active: mode === 'video' }" @click="setMode('video')">动态</button>
          <button :class="{ active: mode === 'image' }" @click="setMode('image')">静态</button>
        </div>
      </div>

      <div class="control-group">
        <label>画面适配</label>
        <div class="btn-group">
          <button :class="{ active: fitMode === 'cover' }" @click="fitMode = 'cover'">填充</button>
          <button :class="{ active: fitMode === 'contain' }" @click="fitMode = 'contain'">包含</button>
        </div>
      </div>

      <div class="control-group">
        <label>亮度 <span>{{ Math.round((1 - brightness) * 100) }}%</span></label>
        <input type="range" min="0" max="1" step="0.01" v-model.number="brightness" @input="saveBrightness" />
      </div>

      <div class="control-group">
        <label>在线图片地址</label>
        <div class="url-input-group">
          <input v-model="onlineUrl" type="url" placeholder="输入图片URL" />
          <button @click="applyOnlineUrl">应用</button>
        </div>
      </div>

      <div class="control-group">
        <label>上传本地图片</label>
        <label class="upload-btn">
          选择文件
          <input type="file" accept="image/*" @change="onFileChange" hidden />
        </label>
      </div>

      <div class="control-group">
        <label>
          <input type="checkbox" :checked="lowPerformance" @change="toggleLowPerformance" />
          低性能模式（禁用视频）
        </label>
      </div>

      <button class="close-panel-btn" @click="showControls = false">关闭</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

// ===== Props =====
const props = defineProps<{
  defaultMode?: 'video' | 'image'
  defaultImage?: string
  defaultVideo?: string
  defaultBrightness?: number
  lowPerformance?: boolean
}>()

type WallpaperMode = 'video' | 'image'
type FitMode = 'cover' | 'contain'

// ===== 安全访问 localStorage =====
const storage = typeof window !== 'undefined' ? window.localStorage : null

// ===== 默认值 =====
const DEFAULT_IMAGE = '/background.jpg'
// 修复1：视频路径改为 public 目录
const videoSrc = props.defaultVideo || '/videos/lemon.mp4'

// ===== localStorage 键名 =====
const DAILY_KEY = 'dailyWallpaper'
const DAILY_DATE_KEY = 'dailyWallpaperDate'
const USER_WALLPAPER_KEY = 'userWallpaper'

// ===== 从 localStorage 恢复（安全访问） =====
const savedMode = storage?.getItem('wallpaperMode') as WallpaperMode | null
const savedImage = storage?.getItem('background')
const savedBrightness = storage?.getItem('wallpaperBrightness')
const savedLowPerf = storage?.getItem('lowPerformance')
const savedFit = storage?.getItem('wallpaperFit') as FitMode | null

// ===== 状态 =====
const mode = ref<WallpaperMode>(savedMode || props.defaultMode || 'video')
const imageUrl = ref(savedImage || props.defaultImage || DEFAULT_IMAGE)
const brightness = ref(
  savedBrightness !== null ? Number(savedBrightness) : (props.defaultBrightness ?? 0.45)
)
const lowPerformance = ref(props.lowPerformance ?? savedLowPerf === 'true')
const fitMode = ref<FitMode>(savedFit || 'cover')

const videoRef = ref<HTMLVideoElement | null>(null)
const onlineUrl = ref('')
const showControls = ref(false)

// ===== 工具 =====
const normalizeBrightness = (v: number) => {
  if (Number.isNaN(v)) return 0.45
  return Math.min(1, Math.max(0, v))
}
brightness.value = normalizeBrightness(brightness.value)

// ===== 每日壁纸获取 =====
const fetchDailyWallpaper = async () => {
  if (storage?.getItem(USER_WALLPAPER_KEY) === 'true') {
    console.log('用户已自定义壁纸，跳过每日更新')
    return
  }

  const today = new Date().toISOString().slice(0, 10)
  const storedDate = storage?.getItem(DAILY_DATE_KEY)
  const storedUrl = storage?.getItem(DAILY_KEY)

  if (storedDate === today && storedUrl) {
    imageUrl.value = storedUrl
    storage?.setItem('background', storedUrl)
    return
  }

  try {
    const res = await fetch('https://picsum.photos/1920/1080', { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const url = res.url
    storage?.setItem(DAILY_KEY, url)
    storage?.setItem(DAILY_DATE_KEY, today)
    storage?.setItem('background', url)
    imageUrl.value = url
    console.log('每日壁纸更新成功')
  } catch (error) {
    console.warn('获取每日壁纸失败，使用本地默认壁纸', error)
    imageUrl.value = DEFAULT_IMAGE
    storage?.setItem('background', DEFAULT_IMAGE)
  }
}

// ===== 核心方法 =====
const setMode = (newMode: WallpaperMode) => {
  mode.value = newMode
  storage?.setItem('wallpaperMode', newMode)
  if (newMode === 'video' && !lowPerformance.value) {
    requestAnimationFrame(() => playVideo())
  } else if (newMode === 'image') {
    if (storage?.getItem(USER_WALLPAPER_KEY) !== 'true') {
      fetchDailyWallpaper()
    }
  }
}

const playVideo = () => {
  if (lowPerformance.value || !videoRef.value) return
  const video = videoRef.value
  if (video.paused && !video.ended) {
    video.muted = true
    video.play().catch(() => {})
  }
}

const saveBrightness = () => {
  storage?.setItem('wallpaperBrightness', String(brightness.value))
}

const applyOnlineUrl = () => {
  const url = onlineUrl.value.trim()
  if (!url || !/^https?:\/\/.+/.test(url)) {
    console.warn('请输入有效的图片地址（以 http:// 或 https:// 开头）')
    return
  }
  storage?.setItem(USER_WALLPAPER_KEY, 'true')
  imageUrl.value = url
  storage?.setItem('background', url)
  setMode('image')
  onlineUrl.value = ''
  showControls.value = false
}

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const result = reader.result as string
    storage?.setItem(USER_WALLPAPER_KEY, 'true')
    imageUrl.value = result
    storage?.setItem('background', result)
    setMode('image')
  }
  reader.readAsDataURL(file)
}

const clearImage = () => {
  storage?.removeItem(USER_WALLPAPER_KEY)
  fetchDailyWallpaper()
}

const resetToDaily = () => {
  storage?.removeItem(USER_WALLPAPER_KEY)
  fetchDailyWallpaper()
}

const toggleLowPerformance = (e: Event) => {
  const checked = (e.target as HTMLInputElement).checked
  lowPerformance.value = checked
  storage?.setItem('lowPerformance', String(checked))
  if (checked && mode.value === 'video') {
    if (imageUrl.value) {
      setMode('image')
    } else {
      videoRef.value?.pause()
    }
  } else if (!checked && mode.value === 'video') {
    requestAnimationFrame(() => playVideo())
  }
}

const onVideoError = () => {
  console.warn('视频壁纸加载失败，切换到静态壁纸')
  if (imageUrl.value) {
    setMode('image')
  } else {
    imageUrl.value = DEFAULT_IMAGE
    setMode('image')
  }
}

const onImageLoad = () => {
  // 图片加载成功可记录
}

const onImageError = () => {
  console.warn('静态壁纸加载失败，尝试回退')
  if (imageUrl.value === DEFAULT_IMAGE) {
    imageUrl.value = ''
    storage?.removeItem('background')
  } else {
    imageUrl.value = DEFAULT_IMAGE
    storage?.setItem('background', DEFAULT_IMAGE)
  }
}

// ===== 性能检测 =====
const checkPerformance = () => {
  if (props.lowPerformance !== undefined) return
  const nav = navigator as Navigator & { deviceMemory?: number }
  const mem = nav.deviceMemory
  const cores = navigator.hardwareConcurrency
  if ((mem && mem < 4) || (cores && cores < 4)) {
    lowPerformance.value = true
    storage?.setItem('lowPerformance', 'true')
    if (mode.value === 'video') {
      if (imageUrl.value) {
        setMode('image')
      } else {
        videoRef.value?.pause()
      }
    }
  }
}

// ===== 监听 =====
watch(fitMode, (val) => {
  storage?.setItem('wallpaperFit', val)
})

// ===== 修复：保存函数引用以便移除 =====
const handleFocus = () => {
  if (!document.hidden && mode.value === 'video' && !lowPerformance.value) {
    const video = videoRef.value
    if (video && video.paused && !video.ended) {
      video.play().catch(() => {})
    }
  }
}

// ===== 生命周期 =====
const handleVideoLoaded = () => {
  if (mode.value === 'video' && !lowPerformance.value) playVideo()
}

const handleVisibilityChange = () => {
  if (lowPerformance.value) return
  if (document.hidden) {
    videoRef.value?.pause()
  } else {
    if (mode.value === 'video') {
      const video = videoRef.value
      if (video && video.paused && !video.ended) {
        video.play().catch(() => {})
      }
    }
  }
}

onMounted(() => {
  checkPerformance()

  if (mode.value === 'image' && storage?.getItem(USER_WALLPAPER_KEY) !== 'true') {
    fetchDailyWallpaper()
  }

  // 修复3：删除 opacity 控制，直接在 CSS 中设置为 1

  const video = videoRef.value
  if (video) {
    video.addEventListener('loadeddata', handleVideoLoaded)
    video.addEventListener('error', onVideoError)
  }
  if (mode.value === 'video' && !lowPerformance.value) {
    requestAnimationFrame(() => playVideo())
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', handleFocus)
})

onUnmounted(() => {
  const video = videoRef.value
  if (video) {
    video.removeEventListener('loadeddata', handleVideoLoaded)
    video.removeEventListener('error', onVideoError)
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', handleFocus) // 修复4：移除正确引用
})

watch(mode, (newMode) => {
  if (newMode === 'video' && !lowPerformance.value) {
    requestAnimationFrame(() => playVideo())
  } else if (newMode === 'image' && storage?.getItem(USER_WALLPAPER_KEY) !== 'true') {
    fetchDailyWallpaper()
  }
})

// ===== 暴露 =====
defineExpose({
  mode,
  imageUrl,
  brightness,
  lowPerformance,
  fitMode,
  setMode,
  setBrightness: (v: number) => {
    brightness.value = normalizeBrightness(v)
    storage?.setItem('wallpaperBrightness', String(brightness.value))
  },
  setImage: (url: string) => {
    const v = url.trim()
    if (!v) return
    storage?.setItem(USER_WALLPAPER_KEY, 'true')
    imageUrl.value = v
    storage?.setItem('background', v)
    setMode('image')
  },
  clearImage,
  resetToDaily,
  toggleLowPerformance,
})
</script>

<style scoped>
/* ===== 壁纸层 ===== */
/* 修复3：删除 opacity: 0，直接设为 1 */
.wallpaper-layer {
  position: fixed;
  inset: 0;
  z-index: -1; /* 修复2：负层级避免遮挡 */
  pointer-events: none;
  background: #111;
  transition: opacity 0.8s ease;
  transform: translateZ(0);
  backface-visibility: hidden;
  isolation: isolate;
}

.wallpaper-layer .wallpaper-video,
.wallpaper-layer .wallpaper-img,
.wallpaper-layer .wallpaper-fallback {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.wallpaper-layer .wallpaper-video {
  display: block;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.wallpaper-layer .wallpaper-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: auto;
  -webkit-optimize-contrast: auto;
}

.wallpaper-layer .wallpaper-fallback {
  background: #1a1a1e;
}

.wallpaper-layer .brightness-overlay {
  position: absolute;
  inset: 0;
  background: #000;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

/* ===== 控制面板 ===== */
.controls-wrapper {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 999999;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}
.controls-wrapper * {
  pointer-events: auto;
}

.dot-trigger {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(8px);
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dot-trigger:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.08);
}
.dot-trigger:active {
  transform: scale(0.92);
}

.controls-panel {
  width: 220px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  color: white;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.control-group label {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}
.btn-group {
  display: flex;
  gap: 6px;
}
.btn-group button {
  flex: 1;
  padding: 4px 0;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: 0.2s;
}
.btn-group button.active {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
}
.btn-group button:hover {
  background: rgba(255, 255, 255, 0.08);
}
input[type="range"] {
  width: 100%;
  accent-color: #9db4ff;
}
.url-input-group {
  display: flex;
  gap: 6px;
}
.url-input-group input {
  flex: 1;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: white;
  outline: none;
}
.url-input-group button {
  padding: 6px 14px;
  border-radius: 6px;
  border: none;
  background: #9db4ff;
  color: #111;
  cursor: pointer;
  font-weight: 500;
  transition: 0.2s;
}
.url-input-group button:hover {
  background: #7a94e0;
}
.upload-btn {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: 0.2s;
  text-align: center;
}
.upload-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}
.close-panel-btn {
  padding: 6px 0;
  border-radius: 6px;
  border: none;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: 0.2s;
}
.close-panel-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}
.control-group input[type="checkbox"] {
  accent-color: #9db4ff;
  transform: scale(1.1);
  margin-right: 6px;
}

@media (max-width: 480px) {
  .controls-wrapper {
    bottom: 16px;
    right: 16px;
  }
  .controls-panel {
    width: 200px;
    padding: 12px 14px;
  }
}
</style>