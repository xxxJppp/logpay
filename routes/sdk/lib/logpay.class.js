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
        let { price, orderNumber, payType, notifyUrl, returnUrl, orderUid, orderName } = data
        let signData = price + payType + orderUid + orderName + orderNumber + notifyUrl + returnUrl + this.uid + this.token
        let Sign = crypto.createHash('md5').update(signData).digest('hex')
        return Sign
    }
    Signfornotify(data) {
        let { payPrice, price, payType, orderNumber, orderUid, signs} = data
        let signData =  payPrice + price + payType + orderNumber + orderUid + signs + this.token
        let Sign = crypto.createHash('md5').update(signData).digest('hex')
        return Sign
    }
}