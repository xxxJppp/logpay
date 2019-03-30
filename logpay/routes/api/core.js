const express = require('express')
const router = express.Router()
const request = require('request')
const Tools = require('../../config/utils')
//引用 mongodb
const Order = require('../../models/Orders')
const Qrcode = require('../../models/Qrcode')
const User = require('../../models/Users')
// 引用工具
let tools = new Tools()
// 获取套餐增加后的时间
function getTime(time, month) {
    let y1 = time.substring(0,4)
    let m1 = parseInt(time.substring(5,7))
    let d1 = parseInt(time.substring(8,10))
    let date = new Date()
    date.setFullYear(y1)
    date.setMonth(m1)
    date.setDate(d1)
    date.setMonth(date.getMonth()+ month )
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`
  }
// 判断套餐时间是否过期
function mealTime(mealtime) {
    let date = new Date()
    let now = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`
    let y1 = now.substring(0,4)
    let m1 = parseInt(now.substring(5,7))
    let d1 = parseInt(now.substring(8,10))
    let y2 = mealtime.substring(0,4)
    let m2 = parseInt(mealtime.substring(5,7))
    let d2 = parseInt(mealtime.substring(8,10))
    if (y2>y1) {
        return true
    } else if (y2 === y1) {
        if (m2>m1) {
            return true
        } else if (m2 === m1) {
            if (d2>d1 || d2 === d1) {
                return true
            } else if (d2 < d1) {
                return false
            }
        } else if (m2 < m1) {
            return false
        }
    } else if (y2 < y1) {
        return false
    }
  }
router.post('/server/api/pay', async (req,res)=>{
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
    async function orderNumberFind (orderNumber, uid, orderUid, payType, price, pay_price) {
        return new Promise((resolve, reject)=>{
            Order.findOne({orderNumber:orderNumber, uid:uid, orderUid:orderUid, payType:payType, price:price, pay_price:pay_price})
                 .then(order => resolve(order))
                 .catch(err => reject(err))
        })
    }
    let o = await orderNumberFind(orderNumber, uid, orderUid, payType, price, pay_price)
    if (o) {
        if (o.status === 2) {
            return res.json('订单已支付!')
        }
        if (o.status === 1) {
            return res.json('回调通知失败,请联系客服!')            
        }
        if (o.status === -1) {
            if (o.expire === 0) {
            return res.json('订单已过期!,请重新发起支付!')                
            } else if (o.expire < 300 && o.expire > 0) {
                    if (payType === 'alipay') {
                        User.findOne({uid:o.uid})
                            .then( user =>{
                                if (!user) {
                                    return false
                                }
                                // 如果没有useid
                                if(user.userid) {
                                    let alipayCodeUrl = 'alipays://platformapi/startapp?appId=20000123&actionType=scan&biz_data={"s":"money","u":"'+ user.userid +'","a":"'+o.pay_price+'","m":""}'
                                    return res.render('alipay.html',{
                                            price: o.pay_price,
                                            orderNumber: o.orderNumber,
                                            codeUrl: alipayCodeUrl,
                                            expire: o.expire,
											uid: o.uid
                                        })
                                    } else {
                                    Qrcode.findOne({price:o.pay_price, uid, type:'支付宝'})
                                            .then( qrcode =>{
                                                if (!qrcode) {
                                                Qrcode.findOne({price:'不固定金额', uid, type:'支付宝'})
                                                        .then( qrcode =>{
                                                            return res.render('alipay.html',{
                                                                price:'请手动输入'+ o.pay_price,
                                                                orderNumber: o.orderNumber,
                                                                codeUrl: qrcode.pay_url,
                                                                expire: o.expire,
																uid: o.uid
                                                            })
                                                        })
                                                        .catch(err => res.json('配置错误!请您配置支付宝不固定额收款码!'))
                                                }
                                                return res.render('alipay.html',{
                                                    price: o.pay_price,
                                                    orderNumber: o.orderNumber,
                                                    codeUrl: qrcode.pay_url,
                                                    expire: o.expire,
													uid: o.uid
                                                })
                                            })
                                            .catch( err => res.json('ali-qr-find-error',err))
                                }
                            })
                            .catch( err=> res.json('ali-uid-find-error'))
                    }
                    if (payType === 'wxpay') {
                        Qrcode.findOne({price:o.pay_price, uid, type:'微信'})
                                .then( qrcode =>{
                                    if (!qrcode) {
                                        Qrcode.findOne({price:'不固定金额', uid, type:'微信'})
                                            .then( code =>{
                                                res.render('wxpay.html',{
                                                price: '请手动输入 ' + o.pay_price,
                                                orderNumber: o.orderNumber,
                                                codeUrl: code.pay_url,
                                                expire: o.expire,
												uid:o.uid
                                            })
                                            })
                                            .catch(err => res.json('配置错误!请您配置微信不固定额收款码!'))
                                    } else {
                                    res.render('wxpay.html',{
                                        price: o.pay_price,
                                        orderNumber: o.orderNumber,
                                        codeUrl: qrcode.pay_url,
                                        expire: o.expire,
										uid:o.uid
                                    })
                                    }
                                })
                                .catch( err =>res.json('wx-qr-find-error'))
                    }
            } else if (o.expire === 300) {
                try {
                    process.kill(o.pid)
                } catch (e) {
                    console.log(e)
                }
                Order.remove({orderNumber:o.orderNumber})
                     .then(order=>res.json('系统繁忙!'))
                     .catch( err=>res.json('300处理失败!'))
            }
        }
    }
    if (!o) {
        Order.findOne({ uid, orderUid, payType, price, pay_price, status:-1, expire:{$gt:0,$lt:300}})
        .then(order=>{
            if (!order) {
                // 验证签名
            if ( sign === sign1 ) {
                //套餐的fee计算
                if(uid !== '10001') {
                User.findOne({uid})
                    .then(user =>{
                        if (user.meal == 'mf') {
                            fee = price*0.1
                        } else if (user.meal == 'bz') {
                            let money = parseFloat(user.money) - parseFloat(20)
                            if(mealTime(user.mealtime)) {
                                fee = price*0.008
                            } else if (!mealTime(user.mealtime) && user.renew && money > 0) {
                                User.update({uid},{money,mealtime:getTime(user.mealtime,1)})
                                    .then( user =>{
                                        fee = price*0.008
                                    })
                                    .catch(err=> { return res.json('renew-failed')})
                            } else if (!mealTime(user.mealtime) && user.renew && money < 0) {
                                User.update({uid},{mealtime:'-',meal:'mf'})
                                    .then( user =>{
                                        fee = price*0.1
                                    })
                                    .catch(err=> { return res.json('renew-failed-for-lack-money') })
                            } else if (!mealTime(user.mealtime) && !user.renew) {
                                User.update({uid},{mealtime:'-',meal:'mf'})
                                    .then( user =>{
                                        fee = price*0.1
                                    })
                                    .catch(err=> { return res.json('renew-failed-for-norenew') })
                            }
                        } else if (user.meal == 'gj') {
                            let money = parseFloat(user.money) - parseFloat(50)
                            if(mealTime(user.mealtime)) {
                                fee = price*0.006
                            } else if (!mealTime(user.mealtime) && user.renew && money > 0) {
                                User.update({uid},{money,mealtime:getTime(user.mealtime,1)})
                                    .then( user =>{
                                        fee = price*0.006
                                    })
                                    .catch(err=> { return res.json('renew-failed')})
                            } else if (!mealTime(user.mealtime) && user.renew && money < 0) {
                                User.update({uid},{mealtime:'-',meal:'mf'})
                                    .then( user =>{
                                        fee = price*0.1
                                    })
                                    .catch(err=> { return res.json('renew-failed-for-lack-money') })
                            } else if (!mealTime(user.mealtime) && !user.renew) {
                                User.update({uid},{mealtime:'-',meal:'mf'})
                                    .then( user =>{
                                        fee = price*0.1
                                    })
                                    .catch(err=> { return res.json('renew-failed-for-norenew') })
                            }
                        }
                        // 判断商户余额是否足够
                        if (parseFloat(user.money)-parseFloat(fee) < 0) {
                            return res.json('商户余额不足,请及时冲值!')
                        }
                    })
                    .catch(err=>res.json('uid-meal-find-error'))				
                } else {
                    fee = '0.000'
                }
                Order.find({ uid, price, payType, status: -1, expire: { $gt: 0, $lt: 300 } })
                    .then(order1 =>{
                    let expireArr1 = order1
                    if (order1.length === 0) {
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
                    function mathTest (order1) {
                        for (let i = 0; i < order1.length; i++) {
                        if( order1[i].pay_price != price - i*0.01) {
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
                    const childProcess = require('child_process')
                    let worker = childProcess.fork('./works.js')
                    let pid = worker.pid
                    let order = new Order({
                        pay_price,price,payType,orderUid,orderName,orderNumber,create_time,pay_time,notify_url,return_url,uid,token,sign1,sign2,status,expire,fee,pid
                    })
                    order.save()
                         .then( ordersave=>{
                                worker.send({
                                    orderNumber,
                                    expire,
									pid
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
                                                expire: expire,
												uid
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
                                                                    expire: expire,
																	uid
                                                                })
                                                            })
                                                        .catch(err => res.json('配置错误!请您配置支付宝不固定额收款码!'))
                                                } else {
                                                    res.render('alipay.html',{
                                                        price: pay_price,
                                                        orderNumber: orderNumber,
                                                        codeUrl: qrcode.pay_url,
                                                        expire: expire,
														uid
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
                                                        expire: expire,
														uid
                                                    })
                                                })
                                                .catch(err => res.json('配置错误!请您配置微信不固定额收款码!'))
                                        } else {
                                        res.render('wxpay.html',{
                                            price: pay_price,
                                            orderNumber: orderNumber,
                                            codeUrl: qrcode.pay_url,
                                            expire: expire,
											uid
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
            } else {
                if (payType === 'alipay') {
                    User.findOne({uid:order.uid})
                        .then( user =>{
                            if (!user) {
                                return false
                            }
                            // 如果没有useid
                            if(user.userid) {
                                let alipayCodeUrl = 'alipays://platformapi/startapp?appId=20000123&actionType=scan&biz_data={"s":"money","u":"'+ user.userid +'","a":"'+order.pay_price+'","m":""}'
                                return res.render('alipay.html',{
                                        price: order.pay_price,
                                        orderNumber: order.orderNumber,
                                        codeUrl: alipayCodeUrl,
                                        expire: order.expire,
										uid:order.uid
                                    })
                                } else {
                                Qrcode.findOne({price:order.pay_price, uid, type:'支付宝'})
                                        .then( qrcode =>{
                                            if (!qrcode) {
                                            Qrcode.findOne({price:'不固定金额', uid, type:'支付宝'})
                                                    .then( qrcode =>{
                                                        return res.render('alipay.html',{
                                                            price:'请手动输入'+ order.pay_price,
                                                            orderNumber: order.orderNumber,
                                                            codeUrl: qrcode.pay_url,
                                                            expire: order.expire,
															uid:order.uid
                                                        })
                                                    })
                                                    .catch(err => res.json('配置错误!请您配置支付宝不固定额收款码!'))
                                            }
                                            return res.render('alipay.html',{
                                                price: order.pay_price,
                                                orderNumber: order.orderNumber,
                                                codeUrl: qrcode.pay_url,
                                                expire: order.expire,
												uid:order.uid
                                            })
                                        })
                                        .catch( err => res.json('ali-qr-find-error',err))
                            }
                        })
                        .catch( err=> res.json('ali-uid-find-error'))
                }
                if (payType === 'wxpay') {
                    Qrcode.findOne({price:order.pay_price, uid, type:'微信'})
                            .then( qrcode =>{
                                if (!qrcode) {
                                    Qrcode.findOne({price:'不固定金额', uid, type:'微信'})
                                        .then( code =>{
                                            res.render('wxpay.html',{
                                            price: '请手动输入 ' + order.pay_price,
                                            orderNumber: order.orderNumber,
                                            codeUrl: code.pay_url,
                                            expire: order.expire,
											uid:order.uid
                                        })
                                        })
                                        .catch(err => res.json('配置错误!请您配置微信不固定额收款码!'))
                                } else {
                                res.render('wxpay.html',{
                                    price: order.pay_price,
                                    orderNumber: order.orderNumber,
                                    codeUrl: qrcode.pay_url,
                                    expire: order.expire,
									uid:order.uid
                                })
                                }
                            })
                            .catch( err =>res.json('wx-qr-find-error'))
                }
            }
    })
	}
})

router.get('/server/api/pay', (req, res)=>{
    res.json('405: Method Not Allowed')
})

router.post('/server/api/query', (req,res)=>{
    let { orderNumber,uid }= req.body
    // 订单查询
    Order.findOne({ orderNumber,uid })
         .then(order=>{
            if (!order) {
                res.send({
                    code: -2,
                    msg: '订单测试'
                })
                return
            }
            if (order.status === 2) { //如果请求的订单已经status = 2了还请求 则存在刷订单情况，返回错误不再执行 
                res.send({
                    code: 1,
                    msg: '交易成功'
                })
            }
            // data.status = 1 // 当监听到支付宝到账时,就确定此订单交易成功，监控会发一个修改status请求改为1
            if (order.status === 1) {
                res.json({
                    code : 1,
                    msg : '支付成功,未通知回调',
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
                                    process.kill(pid,'SIGTERM')
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
                    msg: '未支付'
                })
            }
         })
         .catch( err => res.send('query-order-failed'))
})
module.exports = router