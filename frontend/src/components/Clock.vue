<!-- 最终优化版时钟组件 -->
<template>
  <div class="clock-wrapper">
    <div class="clock__time">{{ timeText }}</div>
    <div class="clock__date">{{ dateText }}</div>
    <div class="clock__proverb">
      <span class="quote-mark">“</span>
      {{ proverbText }}
      <span class="quote-mark">”</span>
    </div>
    <div class="clock__welcome">欢迎</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const timeText = ref('--:--:--')
const dateText = ref('')
const proverbText = ref('')
let timer: ReturnType<typeof setInterval> | undefined

function updateTime() {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  timeText.value = `${hours}:${minutes}:${seconds}`

  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  dateText.value = `${year}-${month}-${day} ${weekDays[now.getDay()]}`
}

function getLocalProverb() {
  const proverbs = [
    '烟花易冷意难明',
    '人生若只如初见',
    '岁月不居，时节如流',
    '海内存知己，天涯若比邻',
    '长风破浪会有时，直挂云帆济沧海',
    '不忘初心，努力前行',
    '死亡不是生命的终点，遗忘才是',
    '就算是堕落浪子，也能力挽狂澜',
    '能不能让故事回到起点',
    '宠辱不惊，闲看庭前花开花落',
  ]
  return proverbs[Math.floor(Math.random() * proverbs.length)]
}

async function fetchProverb() {
  try {
    const res = await fetch('https://v1.hitokoto.cn/', { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (data.hitokoto) {
      proverbText.value = data.hitokoto
      return
    }
    proverbText.value = getLocalProverb()
  } catch {
    proverbText.value = getLocalProverb()
  }
}

onMounted(async () => {
  updateTime()
  await fetchProverb()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.clock-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #f5f8f8;
  font-family: 'Arial', sans-serif;
  text-align: center;
  padding: 8px 0;
}

.clock__time {
  font-size: 3.6rem;
  font-weight: 700;
  letter-spacing: 2px;
  line-height: 1.2;
  background: linear-gradient(135deg, #ffffff 0%, #b0c4ff 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 20px rgba(100, 180, 255, 0.15);
}

.clock__date {
  font-size: 1.2rem;
  margin-top: 4px;
  opacity: 0.75;
  font-weight: 400;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
}

/* ===== 格言（谚语）优化 ===== */
.clock__proverb {
  font-size: 18px;           /* 改为 18px */
  margin-top: 12px;
  opacity: 0.85;
  font-style: italic;
  font-weight: 300;
  max-width: 92%;
  line-height: 1.5;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
}

.clock__proverb .quote-mark {
  font-size: 1.6rem;
  font-weight: 700;
  opacity: 0.4;
  font-family: Georgia, 'Times New Roman', serif;
  line-height: 0.8;
  color: #b0c4ff;
}

.clock__proverb .quote-mark:first-child {
  align-self: flex-start;
  margin-top: 4px;
}

.clock__proverb .quote-mark:last-child {
  align-self: flex-end;
  margin-bottom: 4px;
}

.clock__welcome {
  font-size: 1.0rem;
  margin-top: 6px;
  opacity: 0.5;
  font-weight: 300;
  letter-spacing: 4px;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
}

/* ===== 窄屏适配 ===== */
@media (max-width: 480px) {
  .clock__time {
    font-size: 2.6rem;
  }
  .clock__date {
    font-size: 1.0rem;
  }
  .clock__proverb {
    font-size: 16px;          /* 窄屏略小 */
  }
  .clock__proverb .quote-mark {
    font-size: 1.3rem;
  }
  .clock__welcome {
    font-size: 0.9rem;
  }
}
</style>