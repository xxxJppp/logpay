import { login, logout, getInfo, cpassword, register } from '@/api/login'
import { getKey, setKey, removeKey } from '@/utils/auth'

const user = {
  state: {
    key: getKey(),
    email: '',
    id: '',
    uid: '',
    token: '',
    meal: '',
    mealtime: '',
    money: '',
    roles: []
  },

  mutations: {
    SET_KEY: (state, key) => {
      state.key = key
    },
    SET_EMAIL: (state, email) => {
      state.email = email
    },
    SET_ID: (state, id) => {
      state.id = id
    },
    SET_UID: (state, uid) => {
      state.uid = uid
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_MEAL: (state, meal) => {
      state.meal = meal
    },
    SET_MEALTIME: (state, mealtime) => {
      state.mealtime = mealtime
    },
    SET_MONEY: (state, money) => {
      state.money = money
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    }
  },
  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const email = userInfo.email.trim()
      return new Promise((resolve, reject) => {
        login(email, userInfo.password).then(response => {
          const data = response.data
          setKey(data.token)
          commit('SET_KEY', data.token)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 注册
    Register({ commit }, userInfo) {
      const email = userInfo.email.trim()
      return new Promise((resolve, reject) => {
        register(email, userInfo.password).then(() => {
          login(email, userInfo.password).then(response => {
            const data = response.data
            setKey(data.token)
            commit('SET_KEY', data.token)
            resolve()
          }).catch(error => {
            reject(error)
          })
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo(state.key).then(response => {
          const data = response.data
          if (data.roles && data.roles.length > 0) { // 验证返回的roles是否是一个非空数组
            commit('SET_ROLES', data.roles)
          } else {
            reject('getInfo: roles must be a non-null array!')
          }
          commit('SET_EMAIL', data.email)
          commit('SET_ID', data.id)
          commit('SET_UID', data.uid)
          commit('SET_TOKEN', data.token)
          commit('SET_MEAL', data.meal)
          commit('SET_MEALTIME', data.mealtime)
          commit('SET_MONEY', data.money)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_KEY', '')
          commit('SET_EMAIL', '')
          commit('SET_ID', '')
          commit('SET_UID', '')
          commit('SET_TOKEN', '')
          commit('SET_MEAL', '')
          commit('SET_MEALTIME', '')
          commit('SET_MONEY', '')
          removeKey()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise((resolve, reject) => {
        commit('SET_KEY', '')
        removeKey()
        resolve()
        reject()
      })
    },

    // 修改密码
    Cpassword({ commit, state }, password) {
      return new Promise((resolve, reject) => {
        cpassword(state.email, password.oldpass, password.pass).then(response => {
          const data = response.data
          setKey(data.token)
          commit('SET_KEY', data.token)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    }

    // // 动态修改权限
    // ChangeRoles({ commit, dispatch }, role) {
    //   return new Promise(resolve => {
    //     commit('SET_KEY', role)
    //     setKey(role)
    //     getInfo(role).then(response => {
    //       const data = response.data
    //       commit('SET_ROLES', data.roles)
    //       commit('SET_EMAIL', data.email)
    //       dispatch('GenerateRoutes', data) // 动态修改权限后 重绘侧边菜单
    //       resolve()
    //     })
    //   })
    // }
  }
}
export default user
