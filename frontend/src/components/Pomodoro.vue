<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const totalTime = 25 * 60
const remainTime = ref(totalTime)
const running = ref(false)
const endTime = ref<number | null>(null)
let timer: number | null = null

// 进度环参数（半径 70，周长 ≈ 439.82）
const circumference = 2 * Math.PI * 70
const progress = computed(() => remainTime.value / totalTime)
const offset = computed(() => circumference * (1 - progress.value))

function updateTime() {
  if (!endTime.value) return
  const remain = Math.floor((endTime.value - Date.now()) / 1000)
  if (remain <= 0) {
    remainTime.value = 0
    stop()
    return
  }
  remainTime.value = remain
}

function start() {
  if (running.value) return
  running.value = true
  endTime.value = Date.now() + remainTime.value * 1000
  timer = window.setInterval(updateTime, 500)
  save()
}

function pause() {
  updateTime()
  running.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  save()
}

function stop() {
  running.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  save()
}

function reset() {
  stop()
  remainTime.value = totalTime
  endTime.value = null
  save()
}

function formatTime() {
  const min = Math.floor(remainTime.value / 60)
  const sec = remainTime.value % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function save() {
  localStorage.setItem(
    'pomodoro',
    JSON.stringify({
      remainTime: remainTime.value,
      running: running.value,
      endTime: endTime.value,
    })
  )
}

function load() {
  const data = localStorage.getItem('pomodoro')
  if (!data) return
  const state = JSON.parse(data)
  remainTime.value = state.remainTime
  running.value = state.running
  endTime.value = state.endTime
  if (running.value && endTime.value) {
    updateTime()
    timer = window.setInterval(updateTime, 500)
  }
}

onMounted(() => {
  load()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="pomodoro-card">
    <div class="pomodoro-header">
      <span class="icon"></span>
      <h2>番茄钟</h2>
    </div>

    <div class="time-wrapper">
      <svg class="progress-ring" viewBox="0 0 160 160">
        <!-- 背景圆环 -->
        <circle
          class="ring-bg"
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          stroke-width="10"
        />
        <!-- 进度圆环 -->
        <circle
          class="ring-progress"
          cx="80"
          cy="80"
          r="70"
          fill="none"
          stroke="url(#grad)"
          stroke-width="10"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="offset"
        />
        <!-- 渐变色定义 -->
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3b82f6" />
            <stop offset="100%" stop-color="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div class="time-text">{{ formatTime() }}</div>
    </div>

    <div class="buttons">
      <button class="start-btn" :disabled="running" @click="start">开始</button>
      <button class="pause-btn" :disabled="!running" @click="pause">暂停</button>
      <button class="reset-btn" @click="reset">重置</button>
    </div>
  </div>
</template>

<style scoped>
.pomodoro-card {
  background: rgba(255, 255, 255, 0.05);

  border-radius: 24px;
  padding: 16px 16px 20px;  /* 缩小内边距，减少空白 */
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.pomodoro-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.pomodoro-header .icon {
  font-size: 24px;
}
.pomodoro-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

/* 时间包裹器：自适应宽度，最大 200px */
.time-wrapper {
  position: relative;
  width: 100%;
  max-width: 200px;
  aspect-ratio: 1 / 1;
  margin: 16px auto 24px;  /* 上下间距压缩 */
}

.progress-ring {
  display: block;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-progress {
  transition: stroke-dashoffset 0.5s ease;
  filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.4));
}

.time-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38px;
  font-weight: 700;
  letter-spacing: 3px;
  font-variant-numeric: tabular-nums;
  color: white;
  text-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

button {
  padding: 10px 28px;
  border: none;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

button:hover {
  transform: translateY(-2px);
  filter: brightness(1.2);
}

button:active {
  transform: scale(0.96);
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
}

.start-btn {
  background: #3b82f6;
  color: white;
}
.start-btn:hover {
  background: #2563eb;
}

.pause-btn {
  background: #f59e0b;
  color: #1e1e2a;
}
.pause-btn:hover {
  background: #d97706;
}

.reset-btn {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
}
.reset-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  color: white;
}
</style>