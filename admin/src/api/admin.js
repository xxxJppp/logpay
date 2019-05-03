import request from '@/utils/request'
export function get_merchant(params) {
  return request({
    url: '/user/getMerchant',
    method: 'get',
    params
  })
}

export function get_meal(params) {
  return request({
    url: '/user/getMeal',
    method: 'get',
    params
  })
}

export function change_merchant_meal(data) {
  return request({
    url: '/user/changeMerchantMeal',
    method: 'post',
    data
  })
}

export function add_meal(data) {
  return request({
    url: '/user/addMeal',
    method: 'post',
    data
  })
}

export function change_meal(data) {
  return request({
    url: '/user/changeMeal',
    method: 'post',
    data
  })
}

export function del_meal(data) {
  return request({
    url: '/user/delMeal',
    method: 'delete',
    data
  })
}
