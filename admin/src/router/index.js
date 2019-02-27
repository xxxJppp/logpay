import Vue from 'vue'
import Router from 'vue-router'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if false, the item will hidden in breadcrumb(default is true)
  }
**/
export const constantRouterMap = [
  { path: '/login', component: () => import('@/views/login/index'), hidden: true },
  { path: '/404', component: () => import('@/views/404'), hidden: true },
  // 忘记密码
  {
    path: '/user/fpassword',
    name: 'fpassword',
    hidden: true,
    component: () => import('@/views/fpassword/index')
  },
  // 用户协议
  {
    path: '/user/argeement',
    name: 'argeement',
    hidden: true,
    component: () => import('@/views/argeement/index')
  },
  // 控制台
  {
    path: '/',
    component: Layout,
    name: 'index',
    redirect: 'index',
    children: [{
      path: 'index',
      component: () => import('@/views/index/index'),
      meta: { title: '控制台', icon: 'example' }
    }]
  },
  // 应用配置
  {
    path: '/config',
    name: 'config',
    component: Layout,
    meta: { title: '应用配置', icon: 'nested' },
    children: [
      {
        path: 'conf',
        name: 'conf',
        component: () => import('@/views/conf/index'),
        meta: { title: '配置参数', icon: '' }
      },
      {
        path: 'https://www.kancloud.cn/alei123/logpay-api-document/954360',
        name: 'doc',
        component: () => import('@/views/doc/index'),
        meta: { title: '接口文档', icon: '' }
      },
      {
        path: 'http://logpay.paywz.cn/download/SDK',
        name: 'SDK',
        component: () => import('@/views/sdk/index'),
        meta: { title: 'SDK下载', icon: '' }
      },
      {
        path: 'http://logpay.paywz.cn/download/APK',
        name: 'APK',
        component: () => import('@/views/apk/index'),
        meta: { title: 'APK下载', icon: '' }
      }
    ]
  },
  // 订单管理
  {
    path: '/manage',
    name: 'manage',
    component: Layout,
    meta: { title: '订单管理', icon: 'table' },
    children: [
      {
        path: 'order',
        name: 'Order',
        component: () => import('@/views/order/index'),
        meta: { title: '交易订单', icon: '' }
      }
    ]
  },
  // 个人中心
  {
    path: '/user',
    component: Layout,
    name: 'user',
    meta: { title: '个人中心', icon: 'user' },
    children: [
      {
        path: 'cpassword',
        name: 'cpassword',
        component: () => import('@/views/cpassword/index'),
        meta: { title: '修改密码', icon: '' }
      },
      {
        path: 'cmeal',
        name: 'cmeal',
        component: () => import('@/views/cmeal/index'),
        meta: { title: '更换套餐', icon: '' }
      },
      {
        path: 'recharge',
        name: 'recharge',
        component: () => import('@/views/recharge/index'),
        meta: { title: '账户充值', icon: '' }
      }
    ]
  },
  // 其他的404
  { path: '*', redirect: '/404', hidden: true }
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
