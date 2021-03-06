import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/views/Login.vue'
import Home from '@/views/Home.vue'
import Welcome from '@/views/Welcome.vue'
import UserLIst from '@/views/UserList.vue'
import RightsList from '@/views/Rights.vue'
import RolesList from '@/views/Roles.vue'
import GoodsCate from '@/views/GoodsCate.vue'
import GoodsParams from '@/views/GoodsParams.vue'
Vue.use(VueRouter)

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
        path: '/home',
        component: Home,
        redirect: '/welcome',
        children: [
            { path: '/welcome', component: Welcome },
            { path: '/users', component: UserLIst },
            { path: '/rights', component: RightsList },
            { path: '/roles', component: RolesList },
            { path: '/categories', component: GoodsCate },
            { path: '/params', component: GoodsParams }
        ]
    }
]

const router = new VueRouter({
        routes
    })
    //导航前置守卫
router.beforeEach((to, from, next) => {
    if (to.path === '/login') return next();
    const tokenStr = window.sessionStorage.getItem('token');
    if (!tokenStr) return next('/login');
    next();
})
export default router