import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
import '@/assets/css/global.less'
import tableTree from 'vue-table-with-tree-grid'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
    //axios请求拦截
axios.interceptors.request.use(config => {
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config
})
Vue.prototype.$http = axios
Vue.use(ElementUI)
Vue.config.productionTip = false
Vue.component('table-tree', tableTree)

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')