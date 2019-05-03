import request from '@/utils/request'
// userid
export function get_userid(params) {
  return request({
    url: '/user/getUserid',
    method: 'get',
    params
  })
}
export function submit_userid(data) {
  return request({
    url: '/user/userid',
    method: 'post',
    data
  })
}

// 手机变换
export function get_phoneIds(params) {
  return request({
    url: '/user/getPhone',
    method: 'get',
    params
  })
}
export function add_phone(data) {
  return request({
    url: '/user/addPhone',
    method: 'post',
    data
  })
}
export function get_phone_open(params) {
  return request({
    url: '/user/getPhoneOpen',
    method: 'get',
    params
  })
}
export function c_phone_open(data) {
  return request({
    url: '/user/cPhoneOpen',
    method: 'post',
    data
  })
}

// 限制金额
export function get_limit_money(params) {
  return request({
    url: '/user/getLimitMoney',
    method: 'get',
    params
  })
}
export function c_limit_money(data) {
  return request({
    url: '/user/cLimitMoney',
    method: 'post',
    data
  })
}

// 修改套餐
export function c_meal(data) {
  return request({
    url: '/user/cmeal',
    method: 'post',
    data
  })
}

// 重置密码
export function password_reset(data) {
  return request({
    url: '/user/passwordreset',
    method: 'post',
    data
  })
}
