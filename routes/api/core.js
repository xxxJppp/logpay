let express = require('express')
let router = express.Router()
let request = require('request')
const childProcess = require('child_process')
let Tools = require('../../config/utils')
//引用 mongodb
let Order = require('../../models/Orders')
let userid = '2088422582171022'
// 引用工具
let tools = new Tools()

router.post('/server/api/pay', (req,res)=>{
    let { uid, price, orderNumber, payType, notify_url, return_url, sign, orderUid, orderName } = req.body
    let token = tools.getToken(uid)
    let sign1 =  tools.md5( price + payType + orderUid + orderName + orderNumber + notify_url + return_url + uid + token)
    // price 类型转换
    price = parseFloat(price).toFixed(2)
    let pay_price = price
    let expire
    Order.findOne({ uid, orderUid, price, status: -1})
         .then(data=>{
        // 订单查询
            if (!data) {
                // 新订单
            if ( sign === sign1 ) {
                    //验证sign
                    //利用商户uid 缩小范围
                    Order.find({ uid, price, status: -1, expire: { $gt: 0, $lt: 300 } })
                            .then(data=>{
                            let expireArr1 = data
                            if (data.length === 0) {
                                pay_price = price
                            } else {
                                // 价格排序算法
                            function compareMin(property){
                                return function(a,b){
                                    var value1 = a[property];
                                    var value2 = b[property];
                                    return value1 - value2;
                                }
                            }
                            function compareMax(property) {
                                return function(a,b){
                                    var value1 = a[property];
                                    var value2 = b[property];
                                    return value2 - value1;
                                }
                            }
                            let expireArr2 = expireArr1
                            expireArr1.sort(compareMin('pay_price'))
                            pay_price = expireArr1[0].pay_price - 0.01
                            // 处理算法
                            expireArr2.sort(compareMax("pay_price"))
                            function mathTest (data) {
                                for (let i = 0; i < data.length; i++) {
                                if( data[i].pay_price != price - i*0.01) {
                                pay_price = price - 0.01*i
                                return pay_price
                                }
                            }
                        }
                            if (mathTest(expireArr2)) {
                                pay_price = mathTest(expireArr2)
                            }
                            }
                            pay_price = parseFloat(pay_price).toFixed(2)
                            price = parseFloat(price).toFixed(2)
                            // 存数据库
                            let date = new Date()
                            let YearMD = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')} `
                            let HoursMS = `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}:${date.getSeconds().toString().padStart(2,'0')}`
                            let create_time = YearMD + HoursMS
                            let pay_time = '未支付'
                            let status = -1 //未支付状态
                            expire = 300 //支付时间排序
                            let sign2 = tools.md5( pay_price + price + orderNumber + orderUid + sign1 + token)
                            let order = new Order({
                                pay_price,price,payType,orderUid,orderName,orderNumber,create_time,pay_time,notify_url,return_url,uid,token,sign1,sign2,status,expire
                            })
                            order.save()
                                    .then(data=>{
                                if (payType === 'alipay') {
                                    let alipayCodeUrl = 'alipays://platformapi/startapp?appId=20000123&actionType=scan&biz_data={"s":"money","u":"'+userid+'","a":"'+pay_price+'","m":""}'
                                    res.render('alipay.html',{
                                        price: pay_price,
                                        orderNumber:orderNumber,
                                        codeUrl:alipayCodeUrl,
                                        expire: expire
                                    })
                                }
                                if (payType === 'wxpay') {
                                    let wxpayCodeUrl = 'https://www.paywz.cn'
                                    res.render('wxpay.html',{
                                        price: pay_price,
                                        orderNumber:orderNumber,
                                        codeUrl:wxpayCodeUrl,
                                        expire: expire
                                    })
                                }
                                if (payType === 'bankpay') {
                                    let bankpayCodeUrl = 'https://ds.alipay.com/?from=pc&appId=09999988&actionType=toCard&sourceId=bill&cardNo=6216611500004887333&bankAccount=%e5%91%a8%e7%a3%8a&money= '+ pay_price +' &amount= '+ price +' &bankMark=BOC&bankName=%E4%B8%AD%E5%9B%BD%E9%93%B6%E8%A1%8C'
                                    res.render('bankpay.html',{
                                        price: pay_price,
                                        orderNumber:orderNumber,
                                        codeUrl: bankpayCodeUrl
                                    })
                                }
                                    })
                                    .catch( err => res.json('error!'))

                            let worker = childProcess.fork('./works.js')
                            let remoteData = {
                                orderNumber,
                                expire
                            }
                            worker.send(remoteData)
                            worker.on('message', (msg) => {
                                console.log(msg)
                            })
                            })
                            .catch( err => res.json('error!'))
            } else {
                res.json('签名错误!')
            }
            } else {
                expire = data.expire
                if ( expire > 0 ) {
                    if (payType === 'alipay') {
                        let alipayCodeUrl = 'alipays://platformapi/startapp?appId=20000123&actionType=scan&biz_data={"s":"money","u":"'+userid+'","a":"'+pay_price+'","m":""}'
                        res.render('alipay.html',{
                            price: pay_price,
                            orderNumber: data.orderNumber,
                            codeUrl:alipayCodeUrl,
                            expire: expire
                        })
                    }
                    if (payType === 'wxpay') {
                        let wxpayCodeUrl = 'https://www.paywz.cn'
                        res.render('wxpay.html',{
                            price: pay_price,
                            orderNumber: data.orderNumber,
                            codeUrl:wxpayCodeUrl,
                            expire: expire
                        })
                    }
                }
                    else if ( expire === 0 ) {
                    sign2 = tools.md5( pay_price + price + orderNumber + orderUid + sign1 + token)
                    Order.updateOne({ orderUid,pay_price, uid, status: -1 }, { expire:300, orderNumber,sign1,sign2 })
                            .then(data=>{
                            if (payType === 'alipay') {
                                let alipayCodeUrl = 'alipays://platformapi/startapp?appId=20000123&actionType=scan&biz_data={"s":"money","u":"'+userid+'","a":"'+pay_price+'","m":""}'
                                res.render('alipay.html',{
                                    price: pay_price,
                                    orderNumber: orderNumber,
                                    codeUrl:alipayCodeUrl,
                                    expire: expire
                                })
                            }
                            if (payType === 'wxpay') {
                                let wxpayCodeUrl = 'https://www.paywz.cn'
                                res.render('wxpay.html',{
                                    price:pay_price,
                                    orderNumber: orderNumber,
                                    codeUrl:wxpayCodeUrl,
                                    expire: expire
                                })
                            }
                            })
                            .catch( err => res.json('error!') )
                // 重启旧订单的定时器
                let worker = childProcess.fork('./works.js')
                let remoteData = {
                    orderNumber,
                    expire
                }
                worker.send(remoteData)
                worker.on('message', (msg) => {
                    console.log(msg)
                })
                }
            }})
            // .catch( err => res.json('参数错误!'))
        
})

router.get('/server/api/pay', (req, res)=>{
    res.send('405: Method Not Allowed')
})

router.post('/server/api/query', (req,res)=>{
    let orderNumber = req.body.orderNumber
    Order.findOne({ orderNumber })
         .then(data=>{
            if (!data) {
                res.send({
                    code: -2,
                    msg: 'test'
                })
                return
            }
            if (data.status === 2) { //如果请求的订单已经status = 2了还请求 则存在刷订单情况，返回错误不再执行 
                res.send({
                    code: 1,
                    msg: '充值已完成!'
                })
            }
            else {         
            // data.status = 1 // 当监听到支付宝到账时,就确定此订单交易成功，监控会发一个修改status请求改为1
            if (data.status === 1) {
                let callback = {
                    code : 1,
                    msg : '当前订单已经交易成功',
                    url : data.return_url // return_url
                }
                res.send(callback)
                // 异步通知
                let { pay_price, price ,payType,orderName, orderUid , orderNumber, sign1, sign2, notify_url,status, return_url, uid, expire} = data
                let requestData = {
                    orderUid,
                    pay_price,
                    orderNumber,
                    sign1,
                    price,
                    pay_price,
                    sign2
                }
                httprequest(notify_url,requestData)
                function httprequest(url,data){
                    request({
                        url: url,
                        method: "POST",
                        json: true,
                        headers: {
                            "content-type": "application/json",
                        },
                        body: data
                    }, (error, response, body) => {
                        if (!error && response.statusCode == 200) {
                            //异步回调成功
                            console.log(orderNumber)
                            if (body === 'SUCCESS') {
                                let date = new Date()
                                let YearMD = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')} `
                                let HoursMS = `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}:${date.getSeconds().toString().padStart(2,'0')}`
                                let pay_time = YearMD + HoursMS
                                Order.update( { orderNumber}, {status:2, pay_time})
                                     .then( data=>{
                                      console.log('订单交易成功')
                                     })
                                     .catch(err => res.send('请联系客服!') )
                            }
                        }
                    })
                }
            } else {
                res.send({
                    code : -1,
                    msg: '请扫码完成支付'
                })
            }
        }  
         })
         .catch( err => res.send('error!'))
})
module.exports = router