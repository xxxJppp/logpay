import request from '@/utils/request'
export function getOrder(params) {
  return request({
    url: '/order/getOrder',
    method: 'get',
    params
  })
}

export function getMissOrder(params) {
  return request({
    url: '/order/getMissOrder',
    method: 'get',
    params
  })
}

// 获取区间资金
export function get_day_money(params) {
  return request({
    url: '/order/getDayMoney',
    method: 'get',
    params
  })
}

// 获取区间资金
export function get_order_number(params) {
  return request({
    url: '/order/getOrderNumber',
    method: 'get',
    params
  })
}
