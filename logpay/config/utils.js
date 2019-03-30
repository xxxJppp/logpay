const crypto = require('crypto')
module.exports =  class Tools {
    md5(data) {
    return crypto.createHash('md5').update(data).digest('hex')
    }
    getToken(data) {
        let result = this.md5(data + '16201030240')
        return result
    }
}