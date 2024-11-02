import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect:'/Home' //重定向值登录页
  },
  {
    path: '/Home', //首页布局页
    name: 'Home',
    component: () => import( '../views/Home/home-index.vue'), 
  },
  {
    path: '/Manage', //首页布局页
    name: 'Manage',
    component: () => import( '../views/Manage/manage-index.vue'), 
  }
]

const router = new VueRouter({
  routes
})

export default router
