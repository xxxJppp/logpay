const AipOcrClient = require("baidu-aip-sdk").ocr
const config = require('../config')

// 设置APPID/AK/SK
// 新建一个对象，建议只保存一个对象调用服务接口
const client = new AipOcrClient(config.APPID, config.APIKey, config.SecretKey)

module.exports = client