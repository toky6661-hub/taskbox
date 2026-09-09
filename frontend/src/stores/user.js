import { defineStore } from 'pinia';
import { ref } from 'vue';
export const useUserStore = defineStore('user', () => {
    const user = ref(null);
    function setUser(data) {
        user.value = data;
        localStorage.setItem('user', JSON.stringify(data));
    }
    function loadUser() {
        const userData = localStorage.getItem('user');
        if (userData) {
            user.value = JSON.parse(userData);
        }
    }
    function logout() {
        user.value = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }
    return {
        user,
        setUser,
        loadUser,
        logout
    };
});
//# sourceMappingURL=user.js.map