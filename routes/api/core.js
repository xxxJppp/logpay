const express = require('express')
const router = express.Router()
const request = require('request')
const childProcess = require('child_process')
const Tools = require('../../config/utils')
//引用 mongodb
const Order = require('../../models/Orders')
const Qrcode = require('../../models/Qrcode')
const User = require('../../models/Users')
// 引用工具
let tools = new Tools()
router.post('/server/api/pay', (req,res)=>{
    let { uid, price, orderNumber, payType, notify_url, return_url, sign, orderUid, orderName } = req.body
    // 获取指定用户的token
    let token = tools.getToken(uid)
    // 首次加密
    let sign1 =  tools.md5( price + payType + orderUid + orderName + orderNumber + notify_url + return_url + uid + token)
    price = parseFloat(price).toFixed(2)
    let pay_price
    if (!pay_price) {
       pay_price = price        
    }
    let fee
    Order.findOne({ uid, orderUid, payType, pay_price, status:-1})
         .then(data=>{
        // 订单查询
        if (!data) {
                // 验证签名
            if ( sign === sign1 ) {
                //套餐的fee计算
				if(uid !== '10001') {
                  User.findOne({uid})
                    .then(user =>{
                        if (user.meal == 'mf') {
                            fee = price*0.1
                        } else if (user.meal == 'bz') {
                            fee = price*0.008
                        } else if (user.meal == 'gj') {
                            fee = price*0.006
                        }
						if (parseFloat(user.money)-parseFloat(fee) < 0) {
							return res.json('商户余额不足,请及时冲值!')
						}
                    })
                    .catch(err=>res.json('uid-meal-find-error'))				
				} else {
					fee = '无'
				}
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
                    let expire = 300 //支付时间排序
                    let sign2 = tools.md5( pay_price + price + orderNumber + orderUid + sign1 + token)
                    fee = parseFloat(fee).toFixed(3,'0')
                    let worker = childProcess.fork('./works.js')
                    let pid = worker.pid
                    let order = new Order({
                        pay_price,price,payType,orderUid,orderName,orderNumber,create_time,pay_time,notify_url,return_url,uid,token,sign1,sign2,status,expire,fee,pid
                    })
                    order.save()
                         .then( data=>{
                                worker.send({
                                    orderNumber,
                                    expire
                                })
                        if (payType === 'alipay') {
                            User.findOne({uid})
                                .then( user =>{
                                    // 如果有useid就用userid
                                    if (user.userid) {
                                        let alipayCodeUrl = 'alipays://platformapi/startapp?appId=20000123&actionType=scan&biz_data={"s":"money","u":"'+user.userid+'","a":"'+pay_price+'","m":""}'
                                        res.render('alipay.html',{
                                                price: pay_price,
                                                orderNumber: orderNumber,
                                                codeUrl: alipayCodeUrl,
                                                expire: expire
                                            })
                                    } else {
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
                                                        .catch(err => res.json('配置错误!请您配置支付宝不固定额收款码!'))
                                                } else {
                                                    res.render('alipay.html',{
                                                        price: pay_price,
                                                        orderNumber: orderNumber,
                                                        codeUrl: qrcode.pay_url,
                                                        expire: expire
                                                    })
                                                }
                                            })
                                            .catch( err => res.json('ali-qr-find-error'))
                                    }
                                })
                                .catch( err=> res.json('ali-uid-find-error'))
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
                                                .catch(err => res.json('配置错误!请您配置微信不固定额收款码!'))
                                        } else {
                                        res.render('wxpay.html',{
                                            price: pay_price,
                                            orderNumber: orderNumber,
                                            codeUrl: qrcode.pay_url,
                                            expire: expire
                                        })
                                        }
                                    })
                                    .catch( err => res.json('wx-qr-find-error'))
                            }
                            })
                         .catch( err => res.json('order-save-error'))
                        })
                    .catch( err => res.json('order-finduids-error'))
            } else {
                res.json('签名错误!')
            }

            }
            // 当订单重复刷新，且未过期
            else if(data.expire >0 && data.expire <300 ){
                if (payType === 'alipay') {
                    User.findOne({uid:data.uid})
                        .then( user =>{
                            if (!user) {
                                return false
                            }
                            // 如果没有useid
							if(user.userid) {
								let alipayCodeUrl = 'alipays://platformapi/startapp?appId=20000123&actionType=scan&biz_data={"s":"money","u":"'+ user.userid +'","a":"'+data.pay_price+'","m":""}'
                                res.render('alipay.html',{
                                        price: data.pay_price,
                                        orderNumber: data.orderNumber,
                                        codeUrl: alipayCodeUrl,
                                        expire: data.expire
                                    })
                                } else {
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
                                                    .catch(err => res.json('配置错误!请您配置支付宝不固定额收款码!'))
                                            }
                                            res.render('alipay.html',{
                                                price: data.pay_price,
                                                orderNumber: data.orderNumber,
                                                codeUrl: qrcode.pay_url,
                                                expire: data.expire
                                            })
                                        })
                                        .catch( err => res.json('ali-qr-find-error'))
                            }
                        })
                        .catch( err=> res.json('ali-uid-find-error'))
                }
                if (payType === 'wxpay') {
                    Qrcode.findOne({price:data.pay_price, uid, type:'微信'})
                            .then( qrcode =>{
                                if (!qrcode) {
                                    Qrcode.findOne({price:'不固定金额', uid, type:'微信'})
                                        .then( code =>{
                                            res.render('wxpay.html',{
                                            price: '请手动输入 ' + data.pay_price,
                                            orderNumber: data.orderNumber,
                                            codeUrl: code.pay_url,
                                            expire: data.expire
                                        })
                                        })
                                        .catch(err => res.json('配置错误!请您配置微信不固定额收款码!'))
                                } else {
                                res.render('wxpay.html',{
                                    price: data.pay_price,
                                    orderNumber: data.orderNumber,
                                    codeUrl: qrcode.pay_url,
                                    expire: data.expire
                                })
                                }
                            })
                            .catch( err =>res.json('wx-qr-find-error'))
                }
            }
            //订单重复已过期 status=-1
            // //订单重复status=2 订单交易成功 
            // else if(data.status === 2) {
            //     res.json('订单已经交易成功')
            // }
            // //订单重复status=1 订单回调通知失败,请联系客服手动回调
            // else if (data.status === 1) {
            //     res.json('订单回调通知失败,请联系客服手动回调')
            // }
        })
         .catch( err => res.json('order-finduid-error!'))
})

router.get('/server/api/pay', (req, res)=>{
    res.json('405: Method Not Allowed')
})

router.post('/server/api/query', (req,res)=>{
    let orderNumber = req.body.orderNumber
    // 订单查询
    Order.findOne({ orderNumber })
         .then(order=>{
            if (!order) {
                res.send({
                    code: -2,
                    msg: 'test'
                })
                return
            }
            if (order.status === 2) { //如果请求的订单已经status = 2了还请求 则存在刷订单情况，返回错误不再执行 
                res.send({
                    code: 1,
                    msg: '充值已完成!'
                })
            }
            // data.status = 1 // 当监听到支付宝到账时,就确定此订单交易成功，监控会发一个修改status请求改为1
            if (order.status === 1) {
                res.json({
                    code : 1,
                    msg : '当前订单已经交易成功',
                    url : order.return_url // return_url
                })
                // 异步通知
                let { pay_price, price ,payType,orderName, orderUid , orderNumber, sign1, sign2, notify_url,status, return_url, uid, expire,fee, pid} = order
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
                                try {
                                    process.kill(pid)
                                } catch(e) {
                                    console.log(e)
                                }
                                //fee扣除 和fee计算
                                if (uid !== '10001') {
                                    User.findOne({uid})
                                    .then(user =>{
                                        let money = parseFloat(user.money) - parseFloat(fee)
                                        let Money = money.toFixed(2, '0')
                                        if (Money < 0) {
                                            res.json('账户余额不足')
                                        }
                                        User.updateOne({uid},{money:Money})
                                            .then( admin=>{
                                                let money = parseFloat(admin.money) - parseFloat(fee)
                                                let Money = money.toFixed(2, '0')
                                                User.updateOne({uid:'10001'},{money:Money})
                                                    .then()
                                                    .catch(err=>res.json('fee主账户增加失败'))
                                            })
                                            .catch(err =>res.json('账户fee扣除失败'))
                                    })
                                    .catch('fee-no-user')
                                }
                                //升级status
                                Order.updateMany( { orderNumber}, {status:2, pay_time,expire:0})
                                     .then()
                                     .catch(err => res.send('请联系客服!'))
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
         })
         .catch( err => res.send('系统繁忙'))
})
module.exports = router