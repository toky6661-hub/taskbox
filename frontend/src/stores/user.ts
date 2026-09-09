import { defineStore } from 'pinia'
import { ref } from 'vue'

interface User {
    id:number
    username:string
    email:string
}

export const useUserStore = defineStore(
    'user',
    () =>{
        const user = ref<User | null>(null) 
            
        function setUser (data:User) {
            user.value = data

            localStorage.setItem(
                'user',
                JSON.stringify(data)
            )
        }

        function loadUser() {
            const userData = localStorage.getItem('user')

            if(userData) {
                user.value = JSON.parse(userData)
            }
        }

        function logout(){
            user.value = null

            localStorage.removeItem('user')
            localStorage.removeItem('token')
        }
        return {
            user,
            setUser,
            loadUser,
            logout
        }
    }
)