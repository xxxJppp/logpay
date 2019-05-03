import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'

// create an axios instance
const service = axios.create({
  baseURL: process.env.BASE_API // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  // timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    if (store.getters.key) {
      // let each request carry token --['X-Token'] as a custom key.
      // please modify it according to the actual situation.
      config.headers.Authorization = store.getters.key
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code.
   */
  response => {
    const res = response.data
    if (res.code === -1) {
      Message({
        message: res.msg || 'error',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(res.msg || 'error')
    } else if (res.code === 1 || res.code === 0) {
      return res
    }
  },
  error => {
    const { status, statusText } = error.response
    if (status === 401 && statusText === 'Unauthorized') {
      Message({
        message: '登陆过期，请重新登陆',
        type: 'error',
        duration: 5 * 1000
      })
    } else {
      console.log('err' + error.response.data) // for debug
      Message({
        message: error.response.data,
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(error.response.data)
    }
  }
)

export default service
