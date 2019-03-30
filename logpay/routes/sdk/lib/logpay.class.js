const crypto = require('crypto')
module.exports =  class logpay {
    constructor(uid, token) {
        this.uid = uid
        this.token = token
    }
    callbackSignCheck(data) {
        if (this.Sign(data) === data.callbackSign) {
            return true
        } else {
            return false
        }
    }
    Sign(data) {
        let { price, orderNumber, payType, notify_url, return_url, orderUid, orderName } = data
        let signData = price + payType + orderUid + orderName + orderNumber + notify_url + return_url + this.uid + this.token
        let Sign = crypto.createHash('md5').update(signData).digest('hex')
        return Sign
    }
    Signfornotify(data) {
        let { pay_price, price, orderNumber, orderUid, sign1} = data
        let signData =  pay_price + price + orderNumber + orderUid + sign1 + this.token
        let Sign = crypto.createHash('md5').update(signData).digest('hex')
        return Sign
    }
}