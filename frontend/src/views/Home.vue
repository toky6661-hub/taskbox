<script setup lang="ts">
import { ref, type CSSProperties } from 'vue'
import { useUserStore } from '../stores/user'
import Clock from '../components/Clock.vue'
import Pomodoro from '../components/Pomodoro.vue'
import Quicklinks from '../components/Quicklinks.vue'
import ToolCard from '../components/ToolCard.vue'
import BrowserSearch from '../components/BrowserSerch.vue'   // 新增

const userStore = useUserStore()

const cards = [
  { key: 'pomodoro', component: Pomodoro },
  { key: 'tool', component: ToolCard },
  { key: 'quicklinks', component: Quicklinks },
]

const currentIndex = ref(0)
const total = cards.length

const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + total) % total
}
const next = () => {
  currentIndex.value = (currentIndex.value + 1) % total
}

const getCardStyle = (index: number): CSSProperties => {
  const diff = (index - currentIndex.value + total) % total
  let offset = diff
  if (offset > total / 2) offset -= total
  if (offset < -total / 2) offset += total

  const absOffset = Math.abs(offset)
  const scale = absOffset === 0 ? 1 : (absOffset === 1 ? 0.85 : 0.7)
  const opacity = absOffset === 0 ? 1 : (absOffset === 1 ? 0.6 : 0.3)
  const translateX = offset * 30

  return {
    transform: `translateX(${translateX}%) scale(${scale})`,
    opacity,
    zIndex: absOffset === 0 ? 10 : (absOffset === 1 ? 5 : 1),
    pointerEvents: absOffset === 0 ? 'auto' : 'none',
  } as CSSProperties
}
</script>

<template>
  <div class="home">
    <header class="header">
      <h1>欢迎回来，{{ userStore.user?.username }}</h1>
    </header>

    <div class="dashboard">
      <!-- 时钟卡片 -->
      <section class="card clock-card">
        <Clock />
      </section>

      <!-- 轮播卡片 -->
      <section class="card carousel-card">
        <div class="carousel-container">
          <div
            v-for="(card, index) in cards"
            :key="card.key"
            class="carousel-slide"
            :style="getCardStyle(index)"
          >
            <component :is="card.component" />
          </div>

          <button class="arrow left" @click="prev">‹</button>
          <button class="arrow right" @click="next">›</button>

          <div class="indicators">
            <span
              v-for="(_, idx) in cards"
              :key="idx"
              class="dot"
              :class="{ active: idx === currentIndex }"
              @click="currentIndex = idx"
            ></span>
          </div>
        </div>
      </section>

      <!-- 搜索组件（浏览器风格） -->
      <BrowserSearch />
    </div>
  </div>
</template>

<style scoped>
.home {
  width: 100%;
  min-height: 100%;
  padding: 40px;
  box-sizing: border-box;
  background: transparent;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 30px;
}
.header h1 {
  font-size: 32px;
  font-weight: 600;
  margin: 0;
  color: white;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
}

.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 33.33%;
  min-width: 350px;
  flex-shrink: 0;
  height: auto;
}

.card {
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  padding: 28px 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  overflow: hidden;
}
.card:hover {
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  transform: translateY(-2px);
}

/* ===== 时钟卡片 ===== */
.clock-card {
  height: 280px;
  justify-content: center;
  align-items: center;
}
.clock-card :deep(.clock-wrapper) {
  transform: scale(1);
}
.clock-card :deep(.clock__time) {
  font-size: 4.2rem;
}
.clock-card :deep(.clock__date) {
  font-size: 1.4rem;
}
.clock-card :deep(.clock__proverb) {
  font-size: 1.15rem;
  margin-top: 10px;
}
.clock-card :deep(.clock__welcome) {
  font-size: 1.1rem;
  margin-top: 6px;
}

/* ===== 轮播卡片 ===== */
.carousel-card {
  height: 400px;
  padding: 0;
  position: relative;
  background: rgba(0, 0, 0, 0.45);
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-slide {
  position: absolute;
  width: 94%;
  height: 90%;
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              opacity 0.4s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  will-change: transform, opacity;
  color: white !important;
}

.carousel-slide :deep(span),
.carousel-slide :deep(p),
.carousel-slide :deep(div),
.carousel-slide :deep(h1),
.carousel-slide :deep(h2),
.carousel-slide :deep(h3),
.carousel-slide :deep(h4),
.carousel-slide :deep(h5),
.carousel-slide :deep(h6),
.carousel-slide :deep(li),
.carousel-slide :deep(a),
.carousel-slide :deep(label),
.carousel-slide :deep(button),
.carousel-slide :deep(input) {
  color: white !important;
}

.carousel-slide :deep(input) {
  background: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.carousel-slide :deep(.pomodoro-card) {
  transform: scale(1);
  width: 100%;
  height: 100%;
}
.carousel-slide :deep(.tool-card) {
  height: 100%;
  width: 100%;
}
.carousel-slide :deep(.quick-container) {
  height: 100%;
  width: 100%;
}
.carousel-slide :deep(.tool-card h2) {
  font-size: 20px;
  margin-bottom: 12px;
}
.carousel-slide :deep(.todo-input input) {
  font-size: 15px;
  padding: 10px 16px;
}
.carousel-slide :deep(.todo-input button) {
  font-size: 15px;
  padding: 10px 20px;
}
.carousel-slide :deep(li) {
  padding: 10px 14px;
}
.carousel-slide :deep(li span) {
  font-size: 15px;
}
.carousel-slide :deep(.quick-header h2) {
  font-size: 20px;
  margin-bottom: 8px;
}
.carousel-slide :deep(.website-grid) {
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px;
}
.carousel-slide :deep(.website-card) {
  min-height: 90px;
  padding: 12px;
}
.carousel-slide :deep(.favicon) {
  width: 36px;
  height: 36px;
}
.carousel-slide :deep(.pomodoro-header h2) {
  font-size: 22px;
}
.carousel-slide :deep(.time-wrapper) {
  max-width: 180px;
  margin: 10px auto;
}
.carousel-slide :deep(.time-text) {
  font-size: 38px;
}
.carousel-slide :deep(.buttons button) {
  padding: 10px 24px;
  font-size: 15px;
}

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 26px;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}
.arrow:hover {
  background: rgba(255, 255, 255, 0.15);
}
.arrow:active {
  transform: translateY(-50%) scale(0.92);
}
.arrow.left { left: 10px; }
.arrow.right { right: 10px; }

.indicators {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 15;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: background 0.3s, transform 0.15s;
}
.dot.active {
  background: rgba(255, 255, 255, 0.85);
  transform: scale(1.2);
}
.dot:hover {
  background: rgba(255, 255, 255, 0.5);
}

@media (max-width: 1024px) {
  .dashboard { width: 45%; min-width: 300px; }
  .clock-card { height: 240px; }
  .carousel-card { height: 360px; }
}
@media (max-width: 768px) {
  .home { padding: 16px; }
  .header h1 { font-size: 24px; }
  .dashboard { width: 60%; min-width: 260px; }
  .clock-card { height: 200px; }
  .carousel-card { height: 320px; }
  .clock-card :deep(.clock-wrapper) { transform: scale(0.85); }
  .clock-card :deep(.clock__time) { font-size: 3.2rem; }
  .carousel-slide :deep(.pomodoro-card) { transform: scale(0.9); }
  .carousel-slide :deep(.website-grid) { grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); }
}
@media (max-width: 480px) {
  .dashboard { width: 100%; min-width: 0; }
  .clock-card { height: 180px; }
  .carousel-card { height: 280px; }
  .carousel-slide { width: 94%; height: 82%; }
  .arrow { width: 32px; height: 32px; font-size: 22px; }
}
</style>