import router from './router'
import store from './store'
import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css'// Progress 进度条样式
import { Message } from 'element-ui'
import { getKey } from '@/utils/auth' // 验权

const whiteList = ['/login', '/user/fpassword'] // 不重定向白名单
router.beforeEach((to, from, next) => {
  NProgress.start()
  if (getKey()) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
    } else {
      // 如果用户id没有的话拉取用户信息
      if (store.getters.id === '') {
        store.dispatch('GetInfo').then(res => { // 拉取用户信息
          next()
        }).catch((err) => {
          store.dispatch('FedLogOut').then(() => {
            Message.error(err || 'Verification failed, please login again')
            next({ path: '/' })
          })
        })
      } else {
        next()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    // 如果/fpassword 跳/fpassword
    } else if (whiteList.includes('fpassword')) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)  // 否则全部重定向到登录页 
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done() // 结束Progress
})
