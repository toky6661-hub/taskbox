import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layout/MainLayout.vue';
import Home from '../views/Home.vue';
import Notes from '../views/Notes.vue';
import Blog from '../views/Blog.vue';
import Files from '../views/Files.vue';
import Tools from '../views/Tool.vue';
import Profile from '../views/Profile.vue';
import Settings from '../views/Setting.vue';
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: MainLayout,
            children: [
                { path: '', name: 'home', component: Home },
                { path: 'notes', name: 'notes', component: Notes },
                { path: 'blog', name: 'blog', component: Blog },
                { path: 'files', name: 'files', component: Files },
                { path: 'tools', name: 'tools', component: Tools },
                { path: 'profile', name: 'profile', component: Profile },
                { path: 'settings', name: 'settings', component: Settings },
                // 404 通配符，重定向到首页
                { path: ':pathMatch(.*)*', redirect: '/' }
            ]
        }
    ]
});
export default router;
//# sourceMappingURL=index.js.map