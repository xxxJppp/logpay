const express = require('express')
const app = express()
const router = express.Router()
const Tools = require('../../config/utils')
//引用 mongodb
const Order = require('../../models/Orders')
const Qrcode = require('../../models/Qrcodes')
const User = require('../../models/Users')
const Meal = require('../../models/Meals')
const PhoneId = require('../../models/PhoneIds')
const request = require('request')
// 分发给商户的手机
const getPhoneArr = async (uid) =>{
	return new Promise((resolve, reject)=>{
		PhoneId.find({uid, open:true})
		.then(phone => resolve(phone.map(v =>{
			return v.id
		})))
		.catch(err => reject(err))
	})
}
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
    return `${date.getFullYear()}-${(date.getMonth()).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`
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
	// 判断手机还是电脑
	let deviceAgent = req.headers["user-agent"].toLowerCase()
    let agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/)
	
	let { uid, price, orderNumber, payType, notifyUrl, returnUrl, sign, orderUid, orderName, ip } = req.body
    // 获取指定用户的token
    let token = tools.getToken(uid)
    // 首次加密
    let signs =  tools.md5( price + payType + orderUid + orderName + orderNumber + notifyUrl + returnUrl + uid + token)
	price = parseFloat(price).toFixed(2)
	if(isNaN(price) || price <= 0) {
		return res.send("金额输入错误");
	}
	let fee
	let payPrice
    if (!payPrice) {
       payPrice = price        
    }
	if (payType === 'alipayf2f') {
		// 16进制编码
		function encodeUrl (data) {
		let str = data.split('').map(v=>{
			return v.charCodeAt().toString(16)
		})
		str = str.join('')
		let arr = []
		while (str.length > 0) {
			arr.push(str.substring(0, 2))
			str = str.substring(2, str.length)
		}
		return ('%' + arr.join('%')).toUpperCase()
		}
	 if (sign === signs) {
		let urlencode = require('urlencode')
		async function orderNumberFind (orderNumber) {
        return new Promise((resolve, reject)=>{
            Order.findOne({orderNumber})
                 .then(order => resolve(order))
                 .catch(err => reject(err))
        })
		}
		let o = await orderNumberFind(orderNumber)
		if (o) {
			if (o.status === 2) {
				return res.json('订单已支付')
			}
			if (o.status === 1) {
				return res.json('回调通知失败,请联系客服')            
			}
			if(o.status === -1) {
				if (o.expire === 0) {
				return res.json('订单已过期!,请重新发起支付!')                
				} else if (o.expire < 300 && o.expire > 0) {
					let h5Url = 'https://render.alipay.com/p/s/i?scheme=' + urlencode.encode( 'alipays://platformapi/startapp?saId=10000007&qrcode=' + encodeUrl(o.qrCode + '?_s=web-other'))
					if(agentID){
						return res.redirect(h5Url)
					}else{
						return res.render('alipayf2f.html',{
						codeUrl:o.qrCode,
						orderNumber:o.orderNumber,
						price:o.price,
						orderName:o.orderName,
						uid:o.uid
					})
					}
				}
		}
		}
		if (!o) {
		req.alipayf2f.createQRPay({
			tradeNo: orderNumber,
			subject: orderName,
			totalAmount: price,
			body: orderName,
			timeExpress: 5,
		})
		.then(result => {
			console.log(result)
			if(result.code != 10000) {
				return res.send("支付宝网关返回错误, 请联系客服")
			}
			let { outTradeNo, qrCode, msg, code } = result
            // 出码
			if (code == 10000 && msg == 'Success' && orderNumber === outTradeNo) {
				let h5Url = 'https://render.alipay.com/p/s/i?scheme=' + urlencode.encode( 'alipays://platformapi/startapp?saId=10000007&qrcode=' + encodeUrl(qrCode + '?_s=web-other'))
				let payTime = '未支付'
				let expire = 300
				let status = -1 //未支付状态
				let createTime = tools.localDate()
				fee = parseFloat(0.018*price).toFixed(3,'0')
				let merchantIp = tools.getClientIP(req)
			    const childProcess = require('child_process')
			    let childTimer = childProcess.fork('./timer.js')
			    let pid = childTimer.pid
				let f2fOrder = new Order({
					payPrice,price,payType,orderUid,orderName,orderNumber,payTime,notifyUrl,returnUrl,uid,token,signs,status,fee,createTime,ip,merchantIp,pid,expire,qrCode
				})
				f2fOrder.save()
					 .then(ordersave=>{
							childTimer.send({
								orderNumber,
								expire,
								pid
							})
					 })
					 .catch(err =>{return res.json('f2f-save-error')})
				if(agentID){
					return res.redirect(h5Url)
				}else{
				    return res.render('alipayf2f.html',{
					codeUrl:qrCode,
					orderNumber:outTradeNo,
					price,
					orderName,
					uid
				})
				}
		}
		})
		.catch(error => {
			res.send(error)
		})
		}
		}
	} else {
	// 免签支付
    const orderNumberFind = async (orderNumber, uid, orderUid, payType, price) => {
        return new Promise((resolve, reject)=>{
            Order.findOne({ orderNumber, uid, orderUid, payType, price })
                 .then(order => resolve(order))
                 .catch(err => reject(err))
        })
    }
	let o = await orderNumberFind(orderNumber, uid, orderUid, payType, price, payPrice)
	// 获取手机id
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
                        phoneId.findOne({ uid:o.uid, id:o.phoneId })
                            .then( phone =>{
                                if (!phone) {
                                    return false
                                }
                                // 如果没有useid
                                if(phone.userid) {
                                    let alipayCodeUrl = 'alipays://platformapi/startapp?appId=20000123&actionType=scan&biz_data={"s":"money","u":"'+ phone.userid +'","a":"'+o.payPrice+'","m":""}'
                                    return res.render('alipay.html',{
										    money: o.payPrice,
                                            price: o.price,
											payPrice: o.payPrice,
                                            orderNumber: o.orderNumber,
                                            codeUrl: alipayCodeUrl,
                                            expire: o.expire,
											uid: o.uid
                                        })
                                    } else {
                                    Qrcode.findOne({price:o.payPrice, uid, phoneId:o.phoneId, type:'支付宝'})
                                            .then( qrcode =>{
                                                if (!qrcode) {
                                                Qrcode.findOne({price:'不固定金额', uid, phoneId:o.phoneId, type:'支付宝'})
                                                        .then( qrcode =>{
                                                            return res.render('alipay.html',{
																money: '请手动输入 '+o.payPrice,
                                                                price: o.price,
											                    payPrice: o.payPrice,
                                                                orderNumber: o.orderNumber,
                                                                codeUrl: qrcode.payUrl,
                                                                expire: o.expire,
																uid: o.uid
                                                            })
                                                        })
                                                        .catch(err => res.json('配置错误!请您配置支付宝不固定额收款码!'))
                                                }
                                                return res.render('alipay.html',{
													money: o.payPrice,
                                                    price: o.price,
											        payPrice: o.payPrice,
                                                    orderNumber: o.orderNumber,
                                                    codeUrl: qrcode.payUrl,
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
                        Qrcode.findOne({price:o.payPrice, uid, phoneId:o.phoneId, type:'微信'})
                                .then( qrcode =>{
                                    if (!qrcode) {
                                        Qrcode.findOne({price:'不固定金额', uid, phoneId:o.phoneId, type:'微信'})
                                            .then( code =>{
                                                res.render('wxpay.html',{
												money: '请手动输入 '+o.payPrice,
												price: o.price,
                                                payPrice: o.payPrice,
                                                orderNumber: o.orderNumber,
                                                codeUrl: code.payUrl,
                                                expire: o.expire,
												uid:o.uid
                                            })
                                            })
                                            .catch(err => res.json('配置错误!请您配置微信不固定额收款码!'))
                                    } else {
                                    res.render('wxpay.html',{
										money: o.payPrice,
										price: o.price,
                                        payPrice: o.payPrice,
                                        orderNumber: o.orderNumber,
                                        codeUrl: qrcode.payUrl,
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
		const phoneArr = await getPhoneArr(uid)
		const merchantIp = tools.getClientIP(req)
        Order.findOne({ uid, orderUid, ip, payType, price, status:-1, expire:{ $gt: 0, $lt: 300} })
			.then(order=>{
				if (!order) {
					//套餐的fee计算
					if(uid !== '10001') {
						User.findOne({uid})
							.then(merchant =>{
								if (merchant.meal == 'mf') {
									Meal.findOne({mealName:'mf'})
										.then(meal=>{
											if (meal) {
											fee = price*meal.mealFee											
											}
										})
										.catch(err => res.json('meal-find-error'))
								} else if (merchant.meal == 'bz') {
									Meal.findOne({ mealName:'bz' })
										.then(meal=>{
											if (meal) {
												let money = parseFloat(merchant.money) - parseFloat(meal.mealPrice)
												if(mealTime(merchant.mealtime)) {
													fee = price*meal.mealFee
												} else if (!mealTime(merchant.mealtime) && merchant.renew && money > 0) {
													User.update({uid},{money,mealtime:getTime(merchant.mealtime,1)})
														.then( merchant =>{
															fee = price*meal.mealFee
														})
														.catch(err=> { return res.json('renew-failed')})
												} else if (!mealTime(merchant.mealtime) && merchant.renew && money < 0) {
													User.update({uid},{mealtime:'-',meal:'mf'})
														.then( user => {
																Meal.findOne({mealName:'mf'})
																.then(meal=>{
																	if (meal) {
																	fee = price*meal.mealFee											
																	}
																})
																.catch(err => res.json('meal-find-error'))
														})
														.catch(err=> { return res.json('renew-failed-for-lack-money') })
												} else if (!mealTime(merchant.mealtime) && !merchant.renew) {
													User.update({uid},{mealtime:'-',meal:'mf'})
														.then( user => {
															Meal.findOne({mealName:'mf'})
																.then(meal=>{
																	if (meal) {
																	fee = price*meal.mealFee											
																	}
																})
																.catch(err => res.json('meal-find-error'))
														})
														.catch(err=> { return res.json('renew-failed-for-norenew') })
												}										
											}
										})
										.catch(err => res.json('meal-find-error'))
								} else if (merchant.meal == 'gj') {
									Meal.findOne({mealName:'gj'})
										.then(meal=>{
											if (meal) {
												let money = parseFloat(merchant.money) - parseFloat(meal.mealPrice)
												if(mealTime(merchant.mealtime)) {
													fee = price*meal.mealFee
												} else if (!mealTime(merchant.mealtime) && merchant.renew && money > 0) {
													User.update({uid},{money,mealtime:getTime(merchant.mealtime,1)})
														.then( user =>{
															fee = price*meal.mealFee
														})
														.catch(err=> { return res.json('renew-failed')})
												} else if (!mealTime(merchant.mealtime) && merchant.renew && money < 0) {
													User.update({uid},{mealtime:'-',meal:'mf'})
														.then( user =>{
															Meal.findOne({mealName:'mf'})
																.then(meal=>{
																	if (meal) {
																	fee = price*meal.mealFee											
																	}
																})
																.catch(err => res.json('meal-find-error'))
														})
														.catch(err=> { return res.json('renew-failed-for-lack-money') })
												} else if (!mealTime(merchant.mealtime) && !merchant.renew) {
													User.update({uid},{mealtime:'-',meal:'mf'})
														.then( user =>{
															Meal.findOne({mealName:'mf'})
																.then(meal=>{
																	if (meal) {
																	fee = price*meal.mealFee											
																	}
																})
																.catch(err => res.json('meal-find-error'))
														})
														.catch(err=> { return res.json('renew-failed-for-norenew') })
												}
											}
										})
										.catch(err => res.json('meal-find-error'))
								} else {
									Meal.findOne({mealName:merchant.meal})
										.then(meal =>{
											console.log(meal.mealFee)
											fee = price*meal.mealFee
										})
										.catch(err => res.json('meal-find-error'))
								}
								// 判断商户余额是否足够
								if (parseFloat(merchant.money)-parseFloat(fee) < 0) {
									return res.json('商户余额不足,请及时冲值!')
								} else {
									// 验证签名
									if ( sign === signs ) {
									Order.find({ uid, price, payType, status: -1, expire: { $gt: 0, $lt: 300 } })
											.then(order1 =>{
											let expireArr1 = order1
											if (order1.length === 0) {
												payPrice = price
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
											expireArr1.sort(compareMin('payPrice'))
											payPrice = expireArr1[0].payPrice - 0.01
											// 处理算法
											expireArr2.sort(compareMax("payPrice"))
											// 判断前面的订单排序
											function mathTest (arr) {
												for (let i = 0; i < arr.length; i++) {
												if( arr[i].payPrice != (parseFloat(price) - i*0.01).toFixed(2,'0')) {
												payPrice = parseFloat(price) - 0.01*i
												return payPrice
												}
											}
										}
											if (mathTest(expireArr2)) {
												payPrice = mathTest(expireArr2)
											}
											}
											payPrice = parseFloat(payPrice).toFixed(2)
											if(isNaN(payPrice) || payPrice <= 0) {
												return res.send("请稍后再试");
											}
											price = parseFloat(price).toFixed(2)
											// 得到随机的数组[i]
											const rand = (Min,Max) => {
												let Range = Max - Min
												let Rand = Math.random()
												let num = Min + Math.round(Rand * Range) //四舍五入
												return num
											}
											let phoneLength = phoneArr.length
											// 当 phoneArr 的长度为0即没有手机的时候返回
											if (phoneLength === 0) {
												return res.json({
													code: -1,
													msg: '未配置收款手机'
												})
											}
											let phoneId = phoneArr[rand(0,phoneLength-1)]
											// 存数据库
											let payTime = '未支付'
											let status = -1 //未支付状态
											let expire = 300 //支付时间排序
											let callbackSign = tools.md5( payPrice + price + payType + orderNumber + orderUid + signs + token )
											fee = parseFloat(fee).toFixed(3,'0')
											const childProcess = require('child_process')
											let childTimer = childProcess.fork('./timer.js')
											let pid = childTimer.pid
											let createTime = tools.localDate()
											let order = new Order({
												payPrice,price,payType,orderUid,orderName,orderNumber,payTime,notifyUrl,returnUrl,uid,signs,callbackSign,status,expire,fee,pid,createTime,ip,merchantIp,phoneId
											})
											order.save()
												.then( ordersave=>{
														childTimer.send({
															orderNumber,
															expire,
															pid
														})
												if (payType === 'alipay') {
													PhoneId.findOne({uid, id:phoneId})
														.then( phone =>{
															// 如果有useid就用userid
															if (phone.phoneid) {
																let alipayCodeUrl = 'alipays://platformapi/startapp?appId=20000123&actionType=scan&biz_data={"s":"money","u":"'+phone.userid+'","a":"'+payPrice+'","m":""}'
																res.render('alipay.html',{
																		money: payPrice,
																		price: price,
																		payPrice: payPrice,
																		orderNumber: orderNumber,
																		codeUrl: alipayCodeUrl,
																		expire: expire,
																		uid
																	})
															} else {
															Qrcode.findOne({price:payPrice, uid, phoneId, type:'支付宝'})
																	.then( qrcode =>{
																		if (!qrcode) {
																			Qrcode.findOne({price:'不固定金额', uid, phoneId ,type:'支付宝'})
																				.then( qrcode =>{
																						res.render('alipay.html',{
																							money: '请手动输入 '+payPrice,
																							price: price,
																							payPrice: payPrice,
																							orderNumber: orderNumber,
																							codeUrl: qrcode.payUrl,
																							expire: expire,
																							uid
																						})
																					})
																				.catch(err => res.json('配置错误!请您配置支付宝不固定额收款码!'))
																		} else {
																			res.render('alipay.html',{
																				money: payPrice,
																				price: price,
																				payPrice: payPrice,
																				orderNumber: orderNumber,
																				codeUrl: qrcode.payUrl,
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
													Qrcode.findOne({price:payPrice, uid, phoneId, type:'微信'})
														.then( qrcode =>{
																if (!qrcode) {
																Qrcode.findOne({price:'不固定金额', uid, phoneId ,type:'微信'})
																		.then( qrcode =>{
																			res.render('wxpay.html',{
																				money: '请手动输入 '+payPrice,
																				price: price,
																				payPrice: payPrice,
																				orderNumber: orderNumber,
																				codeUrl: qrcode.payUrl,
																				expire: expire,
																				uid
																			})
																		})
																		.catch(err => res.json('配置错误!请您配置微信不固定额收款码!'))
																} else {
																res.render('wxpay.html',{
																	money: payPrice,
																	price: price,
																	payPrice: payPrice,
																	orderNumber: orderNumber,
																	codeUrl: qrcode.payUrl,
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
							}
							})
							.catch(err=>res.json('uid-meal-find-error'))
						} else {
							// 验证签名
							if ( sign === signs ) {
							fee = '0.000'
							Order.find({ uid, price, payType, status: -1, expire: { $gt: 0, $lt: 300 } })
									.then(order1 =>{
									let expireArr1 = order1
									if (order1.length === 0) {
										payPrice = price
									} else {
										// 价格排序算法
									function compareMin(property){
										return function(a,b){
											let value1 = a[property]
											let value2 = b[property]
											return value1 - value2;
										}
									}
									function compareMax(property) {
										return function(a,b){
											let value1 = a[property]
											let value2 = b[property]
											return value2 - value1;
										}
									}
									let expireArr2 = expireArr1
									expireArr1.sort(compareMin('payPrice'))
									payPrice = expireArr1[0].payPrice - 0.01
									// 处理算法
									expireArr2.sort(compareMax("payPrice"))
									// 判断前面的订单排序
									function mathTest (arr) {
										for (let i = 0; i < arr.length; i++) {
										if( arr[i].payPrice != (parseFloat(price) - i*0.01).toFixed(2,'0')) {
										payPrice = parseFloat(price) - 0.01*i
										return payPrice
										}
									}
								}
									if (mathTest(expireArr2)) {
										payPrice = mathTest(expireArr2)
									}
									}
									payPrice = parseFloat(payPrice).toFixed(2)
									price = parseFloat(price).toFixed(2)
									// 得到随机的数组[i]
									const rand = (Min,Max) => {
										let Range = Max - Min
										let Rand = Math.random()
										let num = Min + Math.round(Rand * Range) //四舍五入
										return num
									}
									let phoneLength = phoneArr.length
									// 当 phoneArr 的长度为0即没有手机的时候返回
									if (phoneLength === 0) {
										return res.json({
											code: -1,
											msg: '未配置收款手机'
										})
									}
									let phoneId = phoneArr[rand(0,phoneLength-1)]
									// 存数据库
									let payTime = '未支付'
									let status = -1 //未支付状态
									let expire = 300 //支付时间排序
									let callbackSign = tools.md5( payPrice + price + payType + orderNumber + orderUid + signs + token)
									fee = parseFloat(fee).toFixed(3,'0')
									const childProcess = require('child_process')
									let childTimer = childProcess.fork('./timer.js')
									let pid = childTimer.pid
									let createTime = tools.localDate()
									let order = new Order({
										payPrice,price,payType,orderUid,orderName,orderNumber,payTime,notifyUrl,returnUrl,uid,signs,callbackSign,status,expire,fee,pid,createTime,ip,merchantIp,phoneId
									})
									order.save()
										.then( ordersave=>{
												childTimer.send({
													orderNumber,
													expire,
													pid
												})
										if (payType === 'alipay') {
											PhoneId.findOne({uid, id:phoneId})
												.then( phone =>{
													// 如果有useid就用userid
													if (phone.userid) {
														let alipayCodeUrl = 'alipays://platformapi/startapp?appId=20000123&actionType=scan&biz_data={"s":"money","u":"'+phone.userid+'","a":"'+payPrice+'","m":""}'
														res.render('alipay.html',{
																money: payPrice,
																price: price,
																payPrice: payPrice,
																orderNumber: orderNumber,
																codeUrl: alipayCodeUrl,
																expire: expire,
																uid
															})
													} else {
													Qrcode.findOne({price:payPrice, uid, phoneId, type:'支付宝'})
															.then( qrcode =>{
																if (!qrcode) {
																	Qrcode.findOne({price:'不固定金额', uid, phoneId, type:'支付宝'})
																		.then( qrcode =>{
																				res.render('alipay.html',{
																					money: '请手动输入 ' + payPrice,
																					price: price,
																					payPrice: payPrice,
																					orderNumber: orderNumber,
																					codeUrl: qrcode.payUrl,
																					expire: expire,
																					uid
																				})
																			})
																		.catch(err => res.json('配置错误!请您配置支付宝不固定额收款码!'))
																} else {
																	res.render('alipay.html',{
																		money: payPrice,
																		price: price,
																		payPrice: payPrice,
																		orderNumber: orderNumber,
																		codeUrl: qrcode.payUrl,
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
											Qrcode.findOne({price:payPrice, uid, phoneId, type:'微信'})
												.then( qrcode =>{
														if (!qrcode) {
														Qrcode.findOne({price:'不固定金额', uid, type:'微信'})
																.then( qrcode =>{
																	res.render('wxpay.html',{
																		money: '请手动输入 '+payPrice,
																		price: price,
																		payPrice: payPrice,
																		orderNumber: orderNumber,
																		codeUrl: qrcode.payUrl,
																		expire: expire,
																		uid
																	})
																})
																.catch(err => res.json('配置错误!请您配置微信不固定额收款码!'))
														} else {
														res.render('wxpay.html',{
															money: payPrice,
															price: price,
															payPrice: payPrice,
															orderNumber: orderNumber,
															codeUrl: qrcode.payUrl,
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
						}
				} else {
					if (payType === 'alipay') {
						PhoneId.findOne({uid:order.uid, id:order.phoneId})
							.then( phone =>{
								if (!phone) {
									return false
								}
								// 如果没有useid
								if(phone.phoneid) {
									let alipayCodeUrl = 'alipays://platformapi/startapp?appId=20000123&actionType=scan&biz_data={"s":"money","u":"'+ phone.userid +'","a":"'+order.payPrice+'","m":""}'
									res.render('alipay.html',{
											money: order.payPrice,
											price: order.price,
											payPrice: order.payPrice,
											orderNumber: order.orderNumber,
											codeUrl: alipayCodeUrl,
											expire: order.expire,
											uid:order.uid
										})
									} else {
									Qrcode.findOne({price:order.payPrice, phoneId, uid, type:'支付宝'})
											.then( qrcode =>{
												if (!qrcode) {
													Qrcode.findOne({price:'不固定金额', uid, phoneId, type:'支付宝'})
														.then( code =>{
															res.render('alipay.html',{
															money: '请手动输入 '+order.payPrice,
															price: order.price,
															payPrice: order.payPrice,
															orderNumber: order.orderNumber,
															codeUrl: code.payUrl,
															expire: order.expire,
															uid:order.uid
														})
														})
														.catch(err => res.json('配置错误!请您配置支付宝不固定额收款码!'))
												} else {
												res.render('alipay.html',{
													money: order.payPrice,
													price: order.price,
													payPrice: order.payPrice,
													orderNumber: order.orderNumber,
													codeUrl: qrcode.payUrl,
													expire: order.expire,
													uid:order.uid
												})
									}
								})
								.catch( err =>res.json('ali-qr-find-error'))
								}
							})
							.catch( err=> res.json('ali-uid-find-error'))
					}
					if (payType === 'wxpay') {
						Qrcode.findOne({price:order.payPrice, uid, phoneId, type:'微信'})
								.then( qrcode =>{
									if (!qrcode) {
										Qrcode.findOne({price:'不固定金额', uid, phoneId, type:'微信'})
											.then( code =>{
												res.render('wxpay.html',{
												money: '请手动输入 '+order.payPrice,
												price: order.price,
												payPrice: order.payPrice,
												orderNumber: order.orderNumber,
												codeUrl: code.payUrl,
												expire: order.expire,
												uid:order.uid
											})
											})
											.catch(err => res.json('配置错误!请您配置微信不固定额收款码!'))
									} else {
									res.render('wxpay.html',{
										money: order.payPrice,
										price: order.price,
										payPrice: order.payPrice,
										orderNumber: order.orderNumber,
										codeUrl: qrcode.payUrl,
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
	}
})

router.get('/server/api/pay', (req, res)=>{
    res.json('405: Method Not Allowed')
})

router.post('/server/api/query', (req,res)=>{
    let { orderNumber,uid,checked }= req.body
	// 订单查询
    Order.findOne({ orderNumber,uid })
         .then(order=>{
			if (!order) {
				return res.send({
					code:-2,
					msg: '订单不存在'
				})
			}
			let { payPrice, price ,payType,orderName, orderUid , orderNumber, signs, callbackSign, notifyUrl,status, returnUrl, uid, expire,fee, pid, Pid} = order
            if (status === -1) {
				res.send({
                    code : -1,
                    msg: '订单未支付'
                })
            }
            else if (status === 2) {
				// 本身的10001同步地址我选择不用
				if (uid === '10001') {
					return res.json({
						code:2,
						msg:'订单交易成功',
						url: returnUrl
					})
				}
				// 同步地址加参数验证更安全
			    let returnUrls = returnUrl + '?sign=' + signs + '&callbackSign=' + callbackSign + '&orderUid=' + orderUid + '&orderNumber=' + orderNumber +'&payPrice='+payPrice +'&price=' + price + '&ip=' + tools.getClientIP(req)
				res.json({
                    code : 2,
                    msg : '订单交易成功',
                    url : returnUrls // returnUrls
                })
            } 
			else if (status === 1) { //回调通知失败
                res.send({
                    code: 1,
                    msg: '订单支付成功，回调失败'
                })
                if (checked) {
					// 异步通知
				try {
					process.kill(Pid,'SIGTERM')
				} catch(e) {
					console.log(e)
				}
				let requestData = {}
				if (payType === 'alipayf2f') {
			    requestData = {
					orderNumber,
					callbackSign:signs,
					price,
					trade_no:'手动回调不提供流水号',
					orderName,
					orderUid,
					payType
				}
				} else {
				requestData = {
					orderUid,
					payType,
					payPrice,
					orderNumber,
					sign:signs,
					price,
					callbackSign
				}
				}
					request({
						url: notifyUrl,
						method: "POST",
						json: true,
						headers: {
							"content-type": "application/json",
						},
						body: requestData
					}, (error, response, body) => {
						if (!error && response.statusCode == 200) {
							//异步回调成功
							console.log(body)
							if (body == 'SUCCESS') {
								let date = new Date()
								let YearMD = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')} `
								let HoursMS = `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}:${date.getSeconds().toString().padStart(2,'0')}`
								let payTime = YearMD + HoursMS
								//fee扣除 和fee计算
								try {
									process.kill(pid,'SIGTERM')
								} catch(e) {
									console.log(e)
								}
								if (uid !== '10001') {
									User.findOne({uid})
									.then(merchant =>{
										let money = parseFloat(merchant.money) - parseFloat(fee)
										let Money = money.toFixed(2, '0')
										if (Money < 0) {
											res.json('账户余额不足')
										}
										User.updateOne({uid},{money:Money})
											.then( merchant=>{
												User.findOne({uid:'10001'})
													.then(admin=>{
														let money = parseFloat(admin.money) + parseFloat(fee)
														let Money = money.toFixed(2, '0')
														User.updateOne({uid:'10001'},{money:Money})
															.then()
															.catch(err=>res.json('fee主账户增加失败'))
													})
													.catch(err => res.json('-fee-admin-find-err'))
											})
											.catch(err =>res.json('账户fee扣除失败'))
									})
									.catch('fee-no-user')
								}
								//升级status
								Order.updateMany( { orderNumber}, {status:2, payTime,expire:0})
									 .then()
									 .catch(err => res.send('请联系客服!'))
							}
						}
					})
				}
            }	
         })
         .catch( err => res.send('query-order-failed'))
})
module.exports = router
