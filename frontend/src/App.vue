<script setup lang="ts">

import { onMounted } from 'vue'
import Login from './views/Login.vue'
import { useUserStore } from './stores/user'

interface User {
  id: number
  username: string
  email: string
}

const userStore = useUserStore()


function handleLoginSuccess(user: User) {
  userStore.setUser(user)
}


onMounted(() => {

  try {

    userStore.loadUser()

  } catch(error) {

    console.error(
      '用户初始化失败:',
      error
    )

  }

})

</script>


<template>

  <Login
    v-if="!userStore.user"
    @login-success="handleLoginSuccess"
  />


  <router-view v-else />


</template>


<style>

html,
body {

  margin:0;
  padding:0;
  height:100%;
  overflow:hidden;

}


#app {

  height:100vh;
  width:100vw;
  overflow:hidden;

}


* {

 box-sizing:border-box;

}

</style>