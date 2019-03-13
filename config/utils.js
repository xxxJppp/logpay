const crypto = require('crypto')
module.exports =  class Tools {
    md5(data) {
    return crypto.createHash('md5').update(data).digest('hex')
    }
    getToken(data) {
        let result = this.md5(data + '16201030240')
        return result
    }
	localDate(data) {
          const d = new Date(data || Date.now())
          d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
          return d.toISOString()
    }
    getClientIP(req) {
	  let target = req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
	  req.connection.remoteAddress || // 判断 connection 的远程 IP
	  req.socket.remoteAddress || // 判断后端的 socket 的 IP
	  req.connection.socket.remoteAddress
	  let ip = []
	  let reg =  /(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
	  ip = reg.exec(target)
	  return ip[0]
	}
}