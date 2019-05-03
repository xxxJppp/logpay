import request from '@/utils/request'
// 启用码
export function open_code(data) {
  return request({
    url: '/qrcode/codeOpen',
    method: 'post',
    data
  })
}

// 删除选中类型
export function remove_type(data) {
  return request({
    url: '/qrcode/removeType',
    method: 'post',
    data
  })
}

// 删除所有码
export function remove_all(data) {
  return request({
    url: '/qrcode/removeAll',
    method: 'post',
    data
  })
}

// 删除选中
export function remove_select(data) {
  return request({
    url: '/qrcode/removeSelect',
    method: 'post',
    data
  })
}

// 删除个码
export function del_qrcode(data) {
  return request({
    url: '/qrcode/del',
    method: 'delete',
    data
  })
}

// 上传七牛
export function up_qiniu() {
  return request({
    url: '/qrcode/updata',
    method: 'post'
  })
}

// 读取二维码列表
export function get_qr_list(params) {
  return request({
    url: '/qrcode/all',
    method: 'get',
    params
  })
}

// 读取二维码内容
export function get_qr_content(data) {
  return request({
    url: '/qrcode/add',
    method: 'post',
    data
  })
}
