<script setup lang="ts">
// Home.vue is a Vue SFC; its type is provided by the Vue compiler at build time.
//import Home from './views/Home.vue';
import Login from './views/Login.vue';
//import MainLayout from './layout/MainLayout.vue';

import { useUserStore } from './stores/user.ts'
import { ref, onMounted } from 'vue';

interface User {
  id:number
  username: string
  email: string
}

/*const currentUser = ref<User | null>(null)*/
const userStore = useUserStore()

const initialized = ref(false)

function handleLoginSuccess(user: User) {
  userStore.setUser(user);
}

onMounted(() => {
  userStore.loadUser()

  initialized.value = true
})

</script>

<template>
  <div v-if="initialized">

  <Login 
    v-if="!userStore.user"
    @login-success="handleLoginSuccess"
  />

 <!--<Home 
    v-else
    :user="userStore.user"
  />--
<MainLayout 
    v-else
  />-->

  <router-view v-else />
  
  </div>
  
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

* {
  box-sizing: border-box;
}
</style>

