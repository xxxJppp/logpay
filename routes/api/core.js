let express = require('express')
let router = express.Router()
let request = require('request')
const childProcess = require('child_process')
let Tools = require('../../config/utils')
//引用 mongodb
let Order = require('../../models/Orders')
const Qrcode = require('../../models/Qrcode')
const User = require('../../models/Users')
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
    Order.findOne({ uid, orderUid, payType, price, status: -1, expire: { $gt: 0, $lt: 300 }})
         .then(data=>{
        // 订单查询
            if (!data) {
                // 新订单
            if ( sign === sign1 ) {
                    //验证sign
                    //利用商户uid 缩小范围
                    Order.find({ uid, price, payType, status: -1, expire: { $gt: 0, $lt: 300 } })
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
                                    User.findOne({uid})
                                    .then( data =>{
                                        if (!data) {
                                            return false
                                        }
                                        // 如果没有useid
                                        if (!data.userid) {
                                            Qrcode.findOne({price:pay_price, uid, type:'支付宝'})
                                          .then( qrcode =>{
                                              if (!qrcode) {
                                                Qrcode.findOne({price:'不固定金额', uid, type:'支付宝'})
                                                      .then( qrcode =>{
                                                            res.render('alipay.html',{
                                                                price: '请手动输入' +pay_price,
                                                                orderNumber: orderNumber,
                                                                codeUrl: qrcode.pay_url,
                                                                expire: expire
                                                            })
                                                        })
                                                       .catch(err => res.json('参数错误!'))
                                              } else {
                                                res.render('alipay.html',{
                                                    price: pay_price,
                                                    orderNumber: orderNumber,
                                                    codeUrl: qrcode.pay_url,
                                                    expire: expire
                                                })
                                              }
                                          })
                                          .catch( err => res.json('参数错误!'))
                                        } else {
                                            let alipayCodeUrl = 'alipays://platformapi/startapp?appId=20000123&actionType=scan&biz_data={"s":"money","u":"'+data.userid+'","a":"'+pay_price+'","m":""}'
                                            res.render('alipay.html',{
                                                    price: pay_price,
                                                    orderNumber: orderNumber,
                                                    codeUrl: alipayCodeUrl,
                                                    expire: expire
                                                })                                        
                                        }
                                    })
                                    .catch( err=> res.json('error'))
                                }
                                if (payType === 'wxpay') {
                                    Qrcode.findOne({price:pay_price, uid, type:'微信'})
                                          .then( qrcode =>{
                                              if (!qrcode) {
                                                Qrcode.findOne({price:'不固定金额', uid, type:'微信'})
                                                      .then( qrcode =>{
                                                            res.render('wxpay.html',{
                                                                price: '请手动输入' + pay_price,
                                                                orderNumber: orderNumber,
                                                                codeUrl: qrcode.pay_url,
                                                                expire: expire
                                                            })
                                                        })
                                                       .catch(err => res.json('参数错误!请您配置微信不固定额收款码!'))
                                              } else {
                                                res.render('wxpay.html',{
                                                    price: pay_price,
                                                    orderNumber: orderNumber,
                                                    codeUrl: qrcode.pay_url,
                                                    expire: expire
                                                })
                                              }
                                          })
                                          .catch( err => res.json('参数错误!212'))
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
            }
            if ( data && data.expire > 0) {
                if (payType === 'alipay') {
                    User.findOne({uid})
                    .then( result =>{
                        if (!result) {
                            return false
                        }
                        // 如果没有useid
                        if (!result.userid) {
                            Qrcode.findOne({price:pay_price, uid, type:'支付宝'})
                          .then( qrcode =>{
                              if (!qrcode) {
                                Qrcode.findOne({price:'不固定金额', uid, type:'支付宝'})
                                      .then( qrcode =>{
                                            res.render('alipay.html',{
                                                price:'请手动输入'+ data.pay_price,
                                                orderNumber: data.orderNumber,
                                                codeUrl: qrcode.pay_url,
                                                expire: data.expire
                                            })
                                        })
                                       .catch(err => res.json('参数错误!'))
                              } else {
                                res.render('alipay.html',{
                                    price: data.pay_price,
                                    orderNumber: data.orderNumber,
                                    codeUrl: qrcode.pay_url,
                                    expire: data.expire
                                })
                              }
                          })
                          .catch( err => res.json('参数错误!'))
                        } else {
                            let alipayCodeUrl = 'alipays://platformapi/startapp?appId=20000123&actionType=scan&biz_data={"s":"money","u":"'+data.userid+'","a":"'+data.pay_price+'","m":""}'
                            res.render('alipay.html',{
                                    price: data.pay_price,
                                    orderNumber: data.orderNumber,
                                    codeUrl: alipayCodeUrl,
                                    expire: data.expire
                                })                                        
                        }
                    })
                    .catch( err=> res.json('error'))
                }
                    if (payType === 'wxpay') {
                        Qrcode.findOne({price:data.pay_price, uid, type:'微信'})
                              .then( qrcode =>{
                                  if (!qrcode) {
                                      Qrcode.findOne({price:'不固定金额', uid, type:'微信'})
                                            .then( qrcode =>{
                                                res.render('wxpay.html',{
                                                price: '请手动输入' + data.pay_price,
                                                orderNumber: data.orderNumber,
                                                codeUrl: qrcode.pay_url,
                                                expire: data.expire
                                            })
                                            })
                                            .catch(err => res.json('参数错误!'))
                                  } else {
                                    res.render('wxpay.html',{
                                        price: data.pay_price,
                                        orderNumber: data.orderNumber,
                                        codeUrl: qrcode.pay_url,
                                        expire: data.expire
                                    })
                                  }
                              })
                              .catch( err =>res.json('参数错误!'))
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
                            if (body === 'SUCCESS') {
                                let date = new Date()
                                let YearMD = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')} `
                                let HoursMS = `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}:${date.getSeconds().toString().padStart(2,'0')}`
                                let pay_time = YearMD + HoursMS
                                Order.update( { orderNumber}, {status:2, pay_time})
                                     .then( data=>{
                                      console.log('订单交易成功')
                                     })
                                     .catch(err => res.send(err))
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








                //     if (data && data.expire === 0 ) {
                //     let sign2 = tools.md5( pay_price + price + orderNumber + orderUid + sign1 + token)
                //     Order.updateOne({ orderUid,pay_price,payType, uid, status: -1 }, { expire:300, orderNumber,sign1,sign2 })
                //             .then(data=>{
                //             if (payType === 'alipay') {
                //                 let alipayCodeUrl = 'alipays://platformapi/startapp?appId=20000123&actionType=scan&biz_data={"s":"money","u":"'+userid+'","a":"'+pay_price+'","m":""}'
                //                 res.render('alipay.html',{
                //                     price: pay_price,
                //                     orderNumber: orderNumber,
                //                     codeUrl:alipayCodeUrl,
                //                     expire: data.expire
                //                 })
                //             }
                //             if (payType === 'wxpay') {
                //                 let wxpayCodeUrl = 'https://www.paywz.cn'
                //                 res.render('wxpay.html',{
                //                     price:pay_price,
                //                     orderNumber: orderNumber,
                //                     codeUrl:wxpayCodeUrl,
                //                     expire: data.expire
                //                 })
                //             }
                //             })
                //             .catch( err => res.json('error!') )
                // // 重启旧订单的定时器
                // let worker = childProcess.fork('./works.js')
                // let remoteData = {
                //     orderNumber,
                //     expire
                // }
                // worker.send(remoteData)
                // worker.on('message', (msg) => {
                //     console.log(msg)
                // })
                // }