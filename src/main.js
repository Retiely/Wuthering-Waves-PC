import Vue from 'vue'
import App from './App.vue'
import './assets/iconfont/iconfont.css'

Vue.config.productionTip = false

import router from './router/index'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)
import '../public/shine'
new Vue({
  //7.注册路由
  router,
  render: h => h(App),
}).$mount('#app')