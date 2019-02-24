import request from '@/utils/request'
export function login(email, password) {
  return request({
    url: '/user/login',
    method: 'post',
    data: {
      email,
      password
    }
  })
}

export function register(email, password) {
  return request({
    url: '/user/register',
    method: 'post',
    data: {
      email,
      password
    }
  })
}

export function getInfo(token) {
  return request({
    url: '/user/getInfo',
    method: 'get',
    headers: { 'Authorization': token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function cpassword(email, oldpassword, password) {
  return request({
    url: '/user/cpassword',
    method: 'post',
    data: {
      email,
      oldpassword,
      password
    }
  })
}

export function fpassword(email) {
  return request({
    url: '/user/passwordreset',
    method: 'post',
    data: {
      email
    }
  })
}
