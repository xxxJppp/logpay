import request from '@/utils/request'

export function getOrder(params) {
  return request({
    url: '/getOrder',
    method: 'get',
    params
  })
}
