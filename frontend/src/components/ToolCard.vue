<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface Task {
  text: string
  done: boolean
}

const newTask = ref('')
const tasks = ref<Task[]>([])

function addTask() {
  const text = newTask.value.trim()
  if (!text) return
  tasks.value.push({ text, done: false })
  newTask.value = ''
}

function removeTask(index: number) {
  tasks.value.splice(index, 1)
}

onMounted(() => {
  const saved = localStorage.getItem('tasks')
  if (saved) {
    try {
      tasks.value = JSON.parse(saved)
    } catch { /* ignore */ }
  }
})

watch(tasks, (val) => {
  localStorage.setItem('tasks', JSON.stringify(val))
}, { deep: true })
</script>

<template>
  <div class="task-card">
    <h2>今日任务</h2>
    <div class="todo-input">
      <!-- 添加 label 和 id -->
      <label for="new-task-input" class="sr-only">新任务</label>
      <input
        id="new-task-input"
        v-model="newTask"
        placeholder="输入任务"
        @keydown.enter="addTask"
      />
      <button class="todo-t" @click="addTask">添加</button>
    </div>
    <ul>
      <li v-for="(task, index) in tasks" :key="index">
        <input type="checkbox" v-model="task.done" />
        <span :class="{ done: task.done }">{{ task.text }}</span>
        <button class="todo-s" @click="removeTask(index)">删除</button>
      </li>
      <li v-if="tasks.length === 0" class="empty-tasks">暂无任务，添加一个吧</li>
    </ul>
  </div>
</template>

<style scoped>
/* 添加 sr-only 类用于屏幕阅读器，视觉上隐藏但保留可访问性 */
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
/* 其余样式不变 */

.task-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}
.task-card h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: white;
  flex-shrink: 0;
}

.todo-input {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  flex-shrink: 0;
}
.todo-input input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: white;
  font-size: 14px;
  outline: none;
  transition: 0.2s;
}
.todo-input input:focus {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
}
.todo-input input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}
.todo-input button {
  padding: 10px 20px;
  border-radius: 999px;
  border: none;
  background: rgba(59, 130, 246, 0.85);
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
  white-space: nowrap;
}
.todo-input button:hover {
  background: #2563eb;
  transform: translateY(-2px);
}
.todo-input button:active {
  transform: scale(0.96);
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0;
  padding-right: 4px;
}
ul::-webkit-scrollbar {
  width: 4px;
}
ul::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}
ul::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
ul::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  transition: background 0.15s;
  flex-shrink: 0;
}
li:hover {
  background: rgba(255, 255, 255, 0.08);
}
li input[type="checkbox"] {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  cursor: pointer;
  position: relative;
  transition: 0.15s;
  flex-shrink: 0;
}
li input[type="checkbox"]:checked {
  background: #3b82f6;
  border-color: #3b82f6;
}
li input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  color: white;
  font-size: 13px;
  left: 2px;
  top: -2px;
}
li span {
  flex: 1;
  color: white;
  font-size: 14px;
  transition: 0.2s;
  word-break: break-word;
}
li span.done {
  text-decoration: line-through;
  opacity: 0.5;
}
li .todo-s {
  padding: 4px 12px;
  border-radius: 999px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  cursor: pointer;
  transition: 0.2s;
  flex-shrink: 0;
}
li .todo-s:hover {
  background: rgba(255, 80, 80, 0.25);
  color: #ff6b6b;
  transform: scale(1.05);
}
.empty-tasks {
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 14px;
  pointer-events: none;
  background: transparent !important;
}
</style>