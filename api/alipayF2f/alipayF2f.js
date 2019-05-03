"use strict";

const config = require('../alipayF2f/alipayF2fConfig')
// 引入支付宝SDK
const AlipaySdk = require('alipay-sdk').default
const alipaySdk = new AlipaySdk({
    appId: config.appid,
    privateKey: config.merchantPrivateKey,
    alipayPublicKey: config.alipayPublicKey,
})
module.exports = class alipay_f2f {

    constructor(config) {
        this._config = {}
        this._config["notifyUrl"] = config["notifyUrl"] || ""

    }

    // 校验支付宝回调签名通知签名
    verifyCallback(postData) {
        console.log(postData)
        return alipaySdk.checkNotifySign(postData)
    }

    createQRPay(option) {
        return new Promise((resolve, reject) => {
            var tradeNo = option["tradeNo"] || "";
            var subject = option["subject"] || "";
            var body = option["body"] || "";
            var totalAmount = option["totalAmount"] || "";
            var timeExpress = option["timeExpress"] || 5;

            if (tradeNo == "") {
                return reject({
                    message: "tradeNo 参数不能为空.", info: null
                });
            }

            if (subject == "") {
                return reject({
                    message: "subject 参数不能为空.", info: null
                });
            }

            if (totalAmount == "") {
                return reject({
                    message: "totalAmount 参数为空.", info: null
                });
            }
            totalAmount = parseFloat(totalAmount);
            if (isNaN(totalAmount)) {
                return reject({
                    message: "totalAmount 参数非法.", info: null
                });
            }

            if (timeExpress == "") {
                return reject({
                    message: "timeExpress 参数为空.", info: null
                });
            }
            timeExpress = parseInt(timeExpress);
            if (isNaN(timeExpress)) {
                return reject({
                    message: "timeExpress 参数非法.", info: null
                });
            }
            timeExpress = timeExpress + "m";

            var alipayArrayData = {};
            alipayArrayData["subject"] = subject;
            alipayArrayData["body"] = body;
            alipayArrayData["out_trade_no"] = tradeNo;
            alipayArrayData["total_amount"] = totalAmount;
            alipayArrayData["timeout_express"] = timeExpress;

            let alipayParams = {}
			alipayParams.notify_url = this._config.notifyUrl
            alipayParams.bizContent = alipayArrayData
            alipaySdk.exec("alipay.trade.precreate", alipayParams, {
                // 验签
                validateSign: true,
                // 打印执行日志
                log: this.logger,
              }).then(resolve).catch(reject)
        })
    }
}

