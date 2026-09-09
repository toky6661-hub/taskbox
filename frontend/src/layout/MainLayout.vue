<script setup lang="ts">
import Sidebar from '../components/Sidebar.vue'
import Header from '../components/Header.vue'
import Wallpaper from '../components/Wallpaper.vue'
</script>

<template>
  <div class="app">
    <Wallpaper />
    <Sidebar />
    <div class="main">
      <Header />
      <div class="page">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: transparent;
  color: white;

  position: relative;
  z-index: 1;
}
.main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  background: transparent;


 
  z-index: 1;
}
.page {
  flex: 1;
  padding: 20px 30px;
  overflow: auto;
  background: transparent;
}
</style>