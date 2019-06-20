const express = require('express')
const router = express.Router()
const Tools = require('../../utils/utils')
const core = require('../../function/coreFunc')
//引用 mongodb
const Order = require('../../models/Orders')
const Qrcode = require('../../models/Qrcodes')
const User = require('../../models/Users')
const PhoneId = require('../../models/PhoneIds')
const request = require('request')
// 为锁准备
const MongoClient = require('mongodb').MongoClient
async function configureMongoDB(config) {
    // Connect to MongoDB
    const conn = await MongoClient.connect('mongodb://localhost:27017/', { useNewUrlParser: true });
    const db = await conn.db('mqpay')
    // Configure MongoDB settings
    await db.executeDbAdminCommand(config)
    // Cleanup
    return conn.close()
}

// const assert = require('assert')
// const AsyncLock = require('async-lock')
// const lock = new AsyncLock()
// let proplock = require('proplock')
// let lock = proplock.lock
// let unlock = proplock.unlock
// 引用工具
let tools = new Tools()
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
let { orderNumberFind, orderFind, getUserMeal, getMfFee, getPayFee, getOtherFee, priceSort, orderSave, getPhoneArr, mathTest, rand } = core

router.post('/server/api/pay', async (req,res)=>{
	let { uid, price, orderNumber, payType, notifyUrl, returnUrl, sign, orderUid, orderName, ip } = req.body
	let { format } = req.query
	//获取html页面
	const showHtml = (payType, uid, phoneId, price, payPrice, orderNumber, expire, createTime) => {
		createTime = createTime.substring(0, 10) + ' ' + createTime.substring(11, 19)
		if (payType === 'alipay') {
			PhoneId.findOne({uid, id:phoneId})
				.then( phone =>{
					if (!phone) {
						return res.json('无该手机')
					}
					// 如果没有useid
					if(phone.userid) {
	//				let alipayCodeUrl = 'alipays://platformapi/startapp?appId=20000123&actionType=scan&biz_data={"s":"money","u":"'+ phone.userid +'","a":"'+payPrice+'","m":""}'
					let alipayCodeUrl = 'https://api.logpay.cn/server/api/alipay?u='+ phone.userid + '&a='+ payPrice+'&_s=web-other'  
					let h5Url = 'https://render.alipay.com/p/s/i?scheme=' + encodeUrl( 'alipays://platformapi/startapp?saId=10000007&qrcode=' + encodeUrl('https://api.logpay.cn/server/api/alipayH5?u='+ phone.userid + '&a='+ payPrice+'&_s=web-other'))
						if ( format && format == 'json' ) {
							res.json({
								code: 1,
								msg: '获取成功',
								payUrl: alipayCodeUrl
							})
						} else {
						res.render('alipay.html',{
								createTime:createTime,
								money: payPrice,
								price: price,
								payPrice: payPrice,
								orderNumber: orderNumber,
								codeUrl: alipayCodeUrl,
								expire: expire,
								uid:uid,
								goAlipay:h5Url
							})
						}
						} else {
						Qrcode.findOne({price:payPrice, phoneId, uid, type:'支付宝'})
								.then( qrcode =>{
									if (!qrcode) {
										Qrcode.findOne({price:'不固定金额', uid, phoneId, type:'支付宝'})
											.then( code =>{
												if ( format && format == 'json' ) {
													res.json({
														code: 1,
														msg: '获取成功',
														payUrl: code.payUrl
													})
												} else {
													let agentID = ''
													try {
														// 判断手机还是电脑
														let deviceAgent = req.headers["user-agent"]
														if (deviceAgent) {
															deviceAgent = deviceAgent.toLowerCase()
														}
														agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/)
													} catch (e) {
														agentID = false
													}
													let h5Url = 'alipays://platformapi/startapp?saId=10000007&qrcode=' + encodeUrl(code.payUrl+'?_s=web-other')
													if (agentID) {
													res.redirect(h5Url)
													} else {
													res.render('alipay.html',{
													createTime:createTime,
													money: '请手动输入 '+ payPrice,
													price: price,
													payPrice: payPrice,
													orderNumber: orderNumber,
													codeUrl: code.payUrl,
													expire: expire,
													uid:uid,
													goAlipay: h5Url
												})}
												}
											})
											.catch(err => res.json('配置错误!请您配置支付宝不固定额收款码!'))
									} else {
										if ( format && format == 'json' ) {
											res.json({
												code: 1,
												msg: '获取成功',
												payUrl: qrcode.payUrl
											})
										} else {
										res.render('alipay.html',{
											createTime:createTime,
											money: payPrice,
											price: price,
											payPrice: payPrice,
											orderNumber: orderNumber,
											codeUrl: qrcode.payUrl,
											expire: expire,
											uid:uid,
											goAlipay: 'alipays:plantformapi'
										})
										}
						}
					})
					.catch( err =>res.json('ali-qr-find-error'))
					}
				})
				.catch( err=> res.json('ali-uid-find-error'))
			}
		if (payType === 'wxpay') {
			Qrcode.findOne({price:payPrice, uid, phoneId, type:'微信'})
					.then( qrcode =>{
						if (!qrcode) {
							Qrcode.findOne({price:'不固定金额', uid, phoneId, type:'微信'})
								.then( code =>{
									if ( format && format == 'json' ) {
										res.json({
											code: 1,
											msg: '获取成功',
											payUrl: code.payUrl
										})
									} else {
										res.render('wxpay.html',{
										createTime:createTime,
										money: '请手动输入 '+payPrice,
										price: price,
										payPrice: payPrice,
										orderNumber: orderNumber,
										codeUrl: code.payUrl,
										expire: expire,
										uid:uid
									})
									}
								})
								.catch(err => res.json('配置错误!请您配置微信不固定额收款码!'))
						} else {
							if ( format && format == 'json' ) {
								res.json({
									code: 1,
									msg: '获取成功',
									payUrl: qrcode.payUrl
								})
							} else {
							res.render('wxpay.html', {
								createTime:createTime,
								money: payPrice,
								price: price,
								payPrice: payPrice,
								orderNumber: orderNumber,
								codeUrl: qrcode.payUrl,
								expire: expire,
								uid:uid
							})
							}
						}
					})
					.catch( err =>res.json('wx-qr-find-error'))
		}
		if (payType === 'lakala') {
			Qrcode.findOne({price:'不固定金额', uid, phoneId, type:'拉卡拉'})
				.then( code =>{
					let h5Url = 'https://render.alipay.com/p/s/i?scheme=' + encodeUrl( 'alipays://platformapi/startapp?saId=10000007&qrcode=' + encodeUrl(code.payUrl +'?_s=web-other'))
					if ( format && format == 'json' ) {
						res.json({
							code: 1,
							msg: '获取成功',
							payUrl: code.payUrl
						})
					} else {
						res.render('lakala.html', {
						createTime:createTime,
						money: '请手动输入 '+payPrice,
						price: price,
						payPrice: payPrice,
						orderNumber: orderNumber,
						codeUrl: code.payUrl,
						expire: expire,
						uid:uid,
						goAlipay: h5Url
					})
					}
				})
				.catch(err => res.json('配置错误!请您配置拉卡拉不固定额收款码!'))
		}
	}
	if (!uid) {
		return res.send('缺少商户uid参数')
	}
	if (!price) {
		return res.send('缺少price参数')
	}
	if (!payType) {
		return res.send('缺少payType参数')
	}
	if (!orderNumber) {
		return res.send('缺少orderNumber参数')
	}
	if (!notifyUrl) {
		return res.send('缺少notifyUrl参数')
	}
    // 获取指定用户的token
	let token = tools.getToken(uid)
    // 首次加密
    let signs =  tools.md5( price + payType + orderUid + orderName + orderNumber + notifyUrl + returnUrl + uid + token)
	price = parseFloat(price).toFixed(2)
	if(isNaN(price) || price <= 0) {
		return res.send("金额输入错误")
	}
	let fee
	let payPrice
    if (!payPrice) {
       payPrice = price        
    }
	// 免签
	let o = await orderNumberFind(orderNumber, uid, orderUid, payType, price, payPrice ).catch(err => { return res.json(err)})
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
				let { payType, phoneId, payPrice, price, orderNumber, expire, uid, createTime } = o
				showHtml(payType, uid, phoneId, price, payPrice, orderNumber, expire, createTime.toISOString())
            } else if (o.expire === 300) {
                try {
                    process.kill(o.pid)
                } catch (e) {
                    console.log(e)
                }
                Order.deleteOne({orderNumber:o.orderNumber})
                     .then(order=>res.json('系统繁忙!'))
                     .catch( err=>res.json('300处理失败!'))
            }
        }
    }
    if (!o) {
		   let existOrder = await orderFind(uid, orderUid, ip, payType, price).catch(err => { return res.json(err)})
		   if (!existOrder) {
			   //套餐的fee计算
					if(uid !== '10001') {
						let merchant = await getUserMeal(uid).catch(err => { return res.json(err)})
						if (merchant.meal == 'mf') {
							fee = await getMfFee(price).catch(err => { return res.json(err)})
						} else if (merchant.meal == 'bz') {
							fee = await getPayFee('bz', merchant, uid, price).catch(err => { return res.json(err)})
						} else if (merchant.meal == 'gj') {
							fee = await getPayFee('gj', merchant, uid, price).catch(err => { return res.json(err)})
						} else {
							fee = await getOtherFee(merchant, price).catch(err => { return res.json(err)})
						}
						// 判断商户余额是否足够
						if (parseFloat(merchant.money)-parseFloat(fee) < 0) {
							return res.json('商户余额不足,请及时冲值!')
						}
						} else {
							fee = '0.00'
						}
						// 验证签名
						if ( sign === signs ) {
					    // 锁住数据库
						// configureMongoDB({'fsyncUnlock': 1}).then(() => {}).catch(console.error)
						// configureMongoDB({'resync': 1}).then(() => {}).catch(console.error)
						console.log('1 '+(new Date).getTime())
						let sortOrder = await priceSort(uid, price, payType).catch(err => { return res.json(err)})
						// configureMongoDB({"fsync": 1,"lock": 1}).then(() => {}).catch(console.error)
						console.log('2 '+ sortOrder + (new Date).getTime())
						let expireArr1 = sortOrder
						if (sortOrder.length === 0) {
							payPrice = price
						} else {
							// 价格排序算法
						const compareMin = (property) =>{
							return (a,b) => {
								let value1 = a[property]
								let value2 = b[property]
								return value1 - value2
							}
						}
						const compareMax = (property) => {
							return (a,b) => {
								let value1 = a[property]
								let value2 = b[property]
								return value2 - value1
							}
						}
						let expireArr2 = expireArr1
						expireArr1.sort(compareMin('payPrice'))
						payPrice = expireArr1[0].payPrice - 0.01
						// 处理算法
						expireArr2.sort(compareMax("payPrice"))
						if (mathTest(expireArr2, price)) {
							payPrice = mathTest(expireArr2, price)
						}
						}
						payPrice = parseFloat(payPrice).toFixed(2)
						if(isNaN(payPrice) || payPrice <= 0) {
							return res.send("请稍后再试")
						}
						price = parseFloat(price).toFixed(2)
						// 获取启用手机数组[1,2,3]
						let phoneArr = await getPhoneArr(uid).catch(err => { return res.json(err)})
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
						// 获取商户ip
						let merchantIp = tools.getClientIP(req)
						let order = new Order({
							payPrice,price,payType,orderUid,orderName,orderNumber,payTime,notifyUrl,returnUrl,uid,signs,callbackSign,status,expire,fee,pid,createTime,ip,merchantIp,phoneId
						})
						// configureMongoDB({'fsyncUnlock': 1}).then(() => {}).catch(console.error)
						console.log('3 '+ (new Date).getTime())
						let successSave = await orderSave(order).catch(err => { return res.json(err)})
						console.log('4 '+ successSave + (new Date).getTime())
						// configureMongoDB({"fsync": 1,"lock": 1}).then(() => {
						// 	configureMongoDB({'fsyncUnlock': 1}).then(() => {}).catch(console.error)
						// }).catch(console.error)
						// const delay = (ms) =>{
						// 	return new Promise((resolve, reject)=>{
						// 		setTimeout(()=>{
						// 			console.log(1)
						// 			resolve(1)
						// 		},ms)
						// 	})
						// }
						// // await delay(5000)
						// process.nextTick(async ()=> await delay(1000))
						if (successSave) {
							childTimer.send({
								orderNumber,
								expire,
								pid
							})
							return showHtml(payType, uid, phoneId, price, payPrice, orderNumber, expire, createTime)			
						}
					} else {
						res.json('签名错误!')
				    }
			} else {
				let { phoneId, uid, payPrice, price, payType, orderNumber, expire, createTime} = existOrder
				return showHtml(payType, uid, phoneId, price, payPrice, orderNumber, expire, createTime.toISOString())
			}
	    }
    })


// router.post('/server/api/pay', async (req,res)=>{
// let { uid, price, orderNumber, payType, notifyUrl, returnUrl, sign, orderUid, orderName, ip } = req.body
// let { format } = req.query
// //获取html页面
// const showHtml = (payType, uid, phoneId, price, payPrice, orderNumber, expire, createTime) => {
// 	createTime = createTime.substring(0, 10) + ' ' + createTime.substring(11, 19)
// 	if (payType === 'alipay') {
// 		PhoneId.findOne({uid, id:phoneId})
// 			.then( phone =>{
// 				if (!phone) {
// 					return false
// 				}
// 				// 如果没有useid
// 				if(phone.userid) {
// //				let alipayCodeUrl = 'alipays://platformapi/startapp?appId=20000123&actionType=scan&biz_data={"s":"money","u":"'+ phone.userid +'","a":"'+payPrice+'","m":""}'
// 				let alipayCodeUrl = 'https://api.logpay.cn/server/api/alipay?u='+ phone.userid + '&a='+ payPrice+'&_s=web-other'  
// 				let h5Url = 'https://render.alipay.com/p/s/i?scheme=' + encodeUrl( 'alipays://platformapi/startapp?saId=10000007&qrcode=' + encodeUrl('https://api.logpay.cn/server/api/alipayH5?u='+ phone.userid + '&a='+ payPrice+'&_s=web-other'))
// 					if ( format && format == 'json' ) {
// 						res.json({
// 							code: 1,
// 							msg: '获取成功',
// 							payUrl: alipayCodeUrl
// 						})
// 					} else {
// 					res.render('alipay.html',{
// 							createTime:createTime,
// 							money: payPrice,
// 							price: price,
// 							payPrice: payPrice,
// 							orderNumber: orderNumber,
// 							codeUrl: alipayCodeUrl,
// 							expire: expire,
// 							uid:uid,
// 							goAlipay:h5Url
// 						})
// 					}
// 					} else {
// 					Qrcode.findOne({price:payPrice, phoneId, uid, type:'支付宝'})
// 							.then( qrcode =>{
// 								if (!qrcode) {
// 									Qrcode.findOne({price:'不固定金额', uid, phoneId, type:'支付宝'})
// 										.then( code =>{
// 											if ( format && format == 'json' ) {
// 												res.json({
// 													code: 1,
// 													msg: '获取成功',
// 													payUrl: code.payUrl
// 												})
// 											} else {
// 												res.json('alipay.html',{
// 												createTime:createTime,
// 												money: '请手动输入 '+ payPrice,
// 												price: price,
// 												payPrice: payPrice,
// 												orderNumber: orderNumber,
// 												codeUrl: code.payUrl,
// 												expire: expire,
// 												uid:uid,
// 												goAlipay: 'alipays:plantformapi'
// 											})
// 											}
// 										})
// 										.catch(err => res.json('配置错误!请您配置支付宝不固定额收款码!'))
// 								} else {
// 									if ( format && format == 'json' ) {
// 										res.json({
// 											code: 1,
// 											msg: '获取成功',
// 											payUrl: qrcode.payUrl
// 										})
// 									} else {
// 									res.render('alipay.html',{
// 										createTime:createTime,
// 										money: payPrice,
// 										price: price,
// 										payPrice: payPrice,
// 										orderNumber: orderNumber,
// 										codeUrl: qrcode.payUrl,
// 										expire: expire,
// 										uid:uid,
// 										goAlipay: 'alipays:plantformapi'
// 									})
// 									}
// 					}
// 				})
// 				.catch( err =>res.json('ali-qr-find-error'))
// 				}
// 			})
// 			.catch( err=> res.json('ali-uid-find-error'))
// 		}
// 	if (payType === 'wxpay') {
// 		Qrcode.findOne({price:payPrice, uid, phoneId, type:'微信'})
// 				.then( qrcode =>{
// 					if (!qrcode) {
// 						Qrcode.findOne({price:'不固定金额', uid, phoneId, type:'微信'})
// 							.then( code =>{
// 								if ( format && format == 'json' ) {
// 									res.json({
// 										code: 1,
// 										msg: '获取成功',
// 										payUrl: code.payUrl
// 									})
// 								} else {
// 									res.render('wxpay.html',{
// 									createTime:createTime,
// 									money: '请手动输入 '+payPrice,
// 									price: price,
// 									payPrice: payPrice,
// 									orderNumber: orderNumber,
// 									codeUrl: code.payUrl,
// 									expire: expire,
// 									uid:uid
// 								})
// 								}
// 							})
// 							.catch(err => res.json('配置错误!请您配置微信不固定额收款码!'))
// 					} else {
// 						if ( format && format == 'json' ) {
// 							res.json({
// 								code: 1,
// 								msg: '获取成功',
// 								payUrl: qrcode.payUrl
// 							})
// 						} else {
// 						res.render('wxpay.html', {
// 							createTime:createTime,
// 							money: payPrice,
// 							price: price,
// 							payPrice: payPrice,
// 							orderNumber: orderNumber,
// 							codeUrl: qrcode.payUrl,
// 							expire: expire,
// 							uid:uid
// 						})
// 						}
// 					}
// 				})
// 				.catch( err =>res.json('wx-qr-find-error'))
// 	}
// 	if (payType === 'lakala') {
// 		Qrcode.findOne({price:'不固定金额', uid, phoneId, type:'拉卡拉'})
// 			.then( code =>{
// 				let h5Url = 'https://render.alipay.com/p/s/i?scheme=' + encodeUrl( 'alipays://platformapi/startapp?saId=10000007&qrcode=' + encodeUrl(code.payUrl +'?_s=web-other'))
// 				if ( format && format == 'json' ) {
// 					res.json({
// 						code: 1,
// 						msg: '获取成功',
// 						payUrl: code.payUrl
// 					})
// 				} else {
// 					res.render('lakala', {
// 					createTime:createTime,
// 					money: '请手动输入 '+payPrice,
// 					price: price,
// 					payPrice: payPrice,
// 					orderNumber: orderNumber,
// 					codeUrl: code.payUrl,
// 					expire: expire,
// 					uid:uid,
// 					goAlipay: h5Url
// 				})
// 				}
// 			})
// 			.catch(err => res.json('配置错误!请您配置拉卡拉不固定额收款码!'))
// 	}
// }
// if (!uid) {
// 	return res.send('缺少商户uid参数')
// }
// if (!price) {
// 	return res.send('缺少price参数')
// }
// if (!payType) {
// 	return res.send('缺少payType参数')
// }
// if (!orderNumber) {
// 	return res.send('缺少orderNumber参数')
// }
// if (!notifyUrl) {
// 	return res.send('缺少notifyUrl参数')
// }
// // 获取指定用户的token
// let token = tools.getToken(uid)
// // 首次加密
// let signs =  tools.md5( price + payType + orderUid + orderName + orderNumber + notifyUrl + returnUrl + uid + token)
// price = parseFloat(price).toFixed(2)
// if(isNaN(price) || price <= 0) {
// 	return res.send("金额输入错误")
// }
// let fee
// let payPrice
// if (!payPrice) {
// 	payPrice = price        
// }
// // 免签
// let o = await orderNumberFind(orderNumber, uid, orderUid, payType, price, payPrice ).catch(err => { return res.json(err) })
// if (o) {
// 	if (o.status === 2) {
// 		return res.json('订单已支付!')
// 	}
// 	if (o.status === 1) {
// 		return res.json('回调通知失败,请联系客服!')            
// 	}
// 	if (o.status === -1) {
// 		if (o.expire === 0) {
// 		return res.json('订单已过期!,请重新发起支付!')                
// 		} else if (o.expire < 300 && o.expire > 0) {
// 			let { payType, phoneId, payPrice, price, orderNumber, expire, uid, createTime } = o
// 			showHtml(payType, uid, phoneId, price, payPrice, orderNumber, expire, createTime.toISOString())
// 		} else if (o.expire === 300) {
// 			try {
// 				process.kill(o.pid)
// 			} catch (e) {
// 				console.log(e)
// 			}
// 			Order.deleteOne({orderNumber:o.orderNumber})
// 					.then(order=>res.json('系统繁忙!'))
// 					.catch( err=>res.json('300处理失败!'))
// 		}
// 	}
//     }
// if (!o) {
// 		let existOrder = await orderFind(uid, orderUid, ip, payType, price).catch(err => { return res.json(err)})
// 		if (!existOrder) {
// 			//套餐的fee计算
// 				if(uid !== '10001') {
// 					let merchant = await getUserMeal(uid).catch(err => { return res.json(err)})
// 					if (merchant.meal == 'mf') {
// 						fee = await getMfFee(price).catch(err => { return res.json(err)})
// 					} else if (merchant.meal == 'bz') {
// 						fee = await getPayFee('bz', merchant, uid, price).catch(err => { return res.json(err)})
// 					} else if (merchant.meal == 'gj') {
// 						fee = await getPayFee('gj', merchant, uid, price).catch(err => { return res.json(err)})
// 					} else {
// 						fee = await getOtherFee(merchant, price).catch(err => { return res.json(err)})
// 					}
// 					// 判断商户余额是否足够
// 					if (parseFloat(merchant.money)-parseFloat(fee) < 0) {
// 						return res.json('商户余额不足,请及时冲值!')
// 					}
// 					} else {
// 						fee = '0.00'
// 					}
// 					// 验证签名
// 					if ( sign === signs ) {
// 						price = parseFloat(price).toFixed(2)
// 						// 获取启用手机数组[1,2,3]
// 						let phoneArr = await getPhoneArr(uid).catch(err => { return res.json(err)})
// 						let phoneLength = phoneArr.length
// 						// 当 phoneArr 的长度为0即没有手机的时候返回
// 						if (phoneLength === 0) {
// 							return res.json({
// 								code: -1,
// 								msg: '未配置收款手机'
// 							})
// 						}
// 						let phoneId = phoneArr[rand(0,phoneLength-1)]
// 						// 存数据库
// 						let payTime = '未支付'
// 						let status = -1 //未支付状态
// 						let expire = 300 //支付时间排序
// 						fee = parseFloat(fee).toFixed(3)
// 						const childProcess = require('child_process')
// 						let childTimer = childProcess.fork('./timer.js')
// 						let pid = childTimer.pid
// 						let createTime = tools.localDate()
// 						// 获取商户ip
// 						let merchantIp = tools.getClientIP(req)
// 						let callbackSign = tools.md5( payPrice + price + payType + orderNumber + orderUid + signs + token )
// 						let order = new Order({
// 							payPrice:'',price,payType,orderUid,orderName,orderNumber,payTime,notifyUrl,returnUrl,uid,signs,callbackSign:'',status,expire,fee,pid,createTime,ip,merchantIp,phoneId
// 						})

// 						let newEvent = (new Date()).getTime()
// 						let taskNumbers = []
// 						let isRunning ={}
// 						taskNumbers.push(newEvent)
// 						taskNumbers.forEach( (number) => {
// 							let key = number
// 							lock.acquire(key, async (cb) => {
// 								assert(!isRunning[key])
// 								assert(lock.isBusy() && lock.isBusy(key))
// 								let successSave = await orderSave(order)
// 								let timespan = Math.random() * 10
// 								console.log('task%s(key%s) start, %s ms', number, key, timespan)
// 								setTimeout(cb.bind(null, null, successSave), timespan);
// 							}, async (err, result) => {
// 								if (err) {
// 									return done(err)
// 								}
// 								console.log(result)
// 								console.log('task%s(key%s) done', number, key)
// 								let sortOrder = await priceSort(uid, price, payType)
// 								let expireArr1 = sortOrder
// 								if (sortOrder.length === 0) {
// 									payPrice = price
// 								} else {
// 									// 价格排序算法
// 								const compareMin = (property) =>{
// 									return (a,b) => {
// 										let value1 = a[property]
// 										let value2 = b[property]
// 										return value1 - value2
// 									}
// 								}
// 								const compareMax = (property) => {
// 									return (a,b) => {
// 										let value1 = a[property]
// 										let value2 = b[property]
// 										return value2 - value1
// 									}
// 								}
// 								let expireArr2 = expireArr1
// 								expireArr1.sort(compareMin('payPrice'))
// 								payPrice = expireArr1[0].payPrice - 0.01
// 								// 处理算法
// 								expireArr2.sort(compareMax("payPrice"))
// 								if (mathTest(expireArr2, price)) {
// 									payPrice = mathTest(expireArr2, price)
// 								}
// 								}
// 								payPrice = parseFloat(payPrice).toFixed(2)
// 								if(isNaN(payPrice) || payPrice <= 0) {
// 									return res.send("请稍后再试")
// 								}
// 								const updatePayPrice = (uid, orderNumber, payPrice, callbackSign) =>{
// 									return new  Promise((resolve, reject)=>{
// 										Order.updateMany({uid, orderNumber}, {payPrice, callbackSign}).then(Order =>resolve(true)).catch(e => reject(e))
// 									})
// 								}
// 								let returnValueForUpdatePayPrice = await updatePayPrice(uid, orderNumber, payPrice, callbackSign)
// 								if (returnValueForUpdatePayPrice) {
// 									isRunning[key] = false
// 									taskNumbers = []
// 									console.log('task%s(key%s) done', number, key)
// 									childTimer.send({
// 										orderNumber,
// 										expire,
// 										pid
// 									})
// 									showHtml(payType, uid, phoneId, price, payPrice, orderNumber, expire, createTime)
// 								}
// 							})
// 						})
// 						// let isRunning = {}
// 						// let key = '0'
// 						// lock.acquire(key, async (cb) => {
// 						// 	assert(!isRunning[key])
// 						// 	assert(lock.isBusy() && lock.isBusy(key))
// 						// 	let successSave = await orderSave(order)
// 						// 	let timespan = Math.random() * 10
// 						// 	setTimeout(cb.bind(null, null, successSave), timespan)
// 						// }, async (err, result) => {
// 						// 	if (err) {
// 						// 		return console.log(err)
// 						// 	}
// 							// assert(!lock.isBusy())
// 							// let sortOrder = await priceSort(uid, price, payType)
// 							// let expireArr1 = sortOrder
// 							// if (sortOrder.length === 0) {
// 							// 	payPrice = price
// 							// } else {
// 							// 	// 价格排序算法
// 							// const compareMin = (property) =>{
// 							// 	return (a,b) => {
// 							// 		let value1 = a[property]
// 							// 		let value2 = b[property]
// 							// 		return value1 - value2
// 							// 	}
// 							// }
// 							// const compareMax = (property) => {
// 							// 	return (a,b) => {
// 							// 		let value1 = a[property]
// 							// 		let value2 = b[property]
// 							// 		return value2 - value1
// 							// 	}
// 							// }
// 							// let expireArr2 = expireArr1
// 							// expireArr1.sort(compareMin('payPrice'))
// 							// payPrice = expireArr1[0].payPrice - 0.01
// 							// // 处理算法
// 							// expireArr2.sort(compareMax("payPrice"))
// 							// if (mathTest(expireArr2, price)) {
// 							// 	payPrice = mathTest(expireArr2, price)
// 							// }
// 							// }
// 							// payPrice = parseFloat(payPrice).toFixed(2)
// 							// if(isNaN(payPrice) || payPrice <= 0) {
// 							// 	return res.send("请稍后再试")
// 							// }
// 							// let callbackSign = tools.md5( payPrice + price + payType + orderNumber + orderUid + signs + token )
// 							// const updatePayPrice = (uid, orderNumber, payPrice, callbackSign) =>{
// 							// 	return new  Promise((resolve, reject)=>{
// 							// 		Order.updateMany({uid, orderNumber}, {payPrice, callbackSign}).then(Order =>resolve(true)).catch(e => reject(e))
// 							// 	})
// 							// }
// 							// let returnValueForUpdatePayPrice = await updatePayPrice(uid, orderNumber, payPrice, callbackSign)
// 							// if (returnValueForUpdatePayPrice) {
// 							// 	childTimer.send({
// 							// 		orderNumber,
// 							// 		expire,
// 							// 		pid
// 							// 	})
// 							// 	showHtml(payType, uid, phoneId, price, payPrice, orderNumber, expire, createTime)
// 							// 	isRunning[key] = false
// 							// }
// 						// })
// 				} else {
// 					res.json('签名错误!')
// 				}
// 		} else {
// 			let { phoneId, uid, payPrice, price, payType, orderNumber, expire, createTime} = existOrder
// 			showHtml(payType, uid, phoneId, price, payPrice, orderNumber, expire, createTime.toISOString())
// 		}
// 	}
// })



router.get('/server/api/pay', (req, res)=>{
	// let newEvent = (new Date()).getTime()
	// let taskNumbers = []
	// let isRunning ={}
	// taskNumbers.push(newEvent)
	// taskNumbers.forEach(function (number) {
	// 	let key = number
	// 	lock.acquire(key, function (cb) {
	// 		assert(!isRunning[key])
	// 		assert(lock.isBusy() && lock.isBusy(key))

	// 		let timespan = Math.random() * 10
	// 		console.log('task%s(key%s) start, %s ms', number, key, timespan)
	// 		setTimeout(cb.bind(null, null, number), timespan);
	// 	}, function (err, result) {
	// 		if (err) {
	// 			return done(err)
	// 		}

	// 		console.log('task%s(key%s) done', number, key)
	// 		isRunning[key] = false
	// 		taskNumbers = []
	// 	})
	// })
	res.json('405: Method Not Allowed')
})

// router.post('/server/api/pay', (req, res)=>{
// 	req.body.format = req.query.format
// 	let { uid, price, orderNumber, payType, notifyUrl, returnUrl, sign, orderUid, orderName, ip, format } = req.body
// 	// 并发连接数的计数器
// 	let concurrencyCount = 0;
// 	let fetchUrl = function (url, callback) {
// 	// delay 的值在 2000 以内，是个随机的整数
// 	let delay = parseInt((Math.random() * 10000000) % 2000, 10);
// 	concurrencyCount++;
// 	console.log('现在的并发数是', concurrencyCount, '，正在抓取的是', url, '，耗时' + delay + '毫秒');
// 	setTimeout(function () {
// 		concurrencyCount--;
// 		callback(null, url + ' html content');
// 	}, delay);
// 	};
// 	fetchUrl('http://127.0.0.1:10008/server/api/core/pay', function (err, content) {
// 	console.log(content)
// 	});
// 	const urls = ['http://127.0.0.1:10008/server/api/core/pay']
// 	async.mapLimit(urls, 1, function (url, callback) {
// 		const options = {
// 			url: url,
// 			method: "POST",
// 			json: true,
// 			headers: {
// 				"content-type": "application/json",
// 				'user-agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/535.1 (KHTML, like Gecko) Chrome/14.0.835.163 Safari/535.1'
// 			},
// 			body: req.body
// 		}
// 		request.post( options, (err, response, body)=>{
// 			if (err) {
// 				return console.log(err)
// 			} else {
// 				console.log(body)
// 			}
// 		})
// 	  }, function (err, result) {
// 		console.log('final:');
// 		console.log(result);
// 	});
// 	// let arr = [];
// 	// arr.push(req.body)
// 	// async.eachSeries(arr, function(item, callback) { 
// 	// 	     console.log('1.3 enter: ' + item.name)
// 	// 	     setTimeout(function(){
// 	// 	         console.log('1.3 handle: ' + item.name)
// 	// 	         callback(null, item.name)
// 	// 	     }, item.delay)
// 	// 	 }, function(err) { 
// 	// 	     console.log('1.3 err: ' + err)
// 	// 	 })	
// })


// router.post('/server/api/pay', async (req,res)=>{
// let merchantIp = tools.getClientIP(req)
// const childProcess = require('child_process')
// let childCore = childProcess.fork('./core.js')
// let remoteData = req.body
// remoteData.format = req.query.format
// remoteData.pid = childCore.pid
// remoteData.merchantIp = merchantIp
// // 发送给子进程
// childCore.send(remoteData)
// childCore.on('message', function(resData) {
// 	let { type, ctx, render } = resData
// 	if (type == 'json') {
// 		res.json(ctx)
// 	}
// 	if (type == 'render') {
// 		res.render(render, ctx)
// 	}
// })

router.post('/server/api/query', (req,res)=>{
	let { orderNumber, uid, checked, Status } = req.body
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
			if (status === -1 && Status !== -1) {
				res.send({
					code : -1,
					msg: '订单未支付'
				})
			}
			if (status === 2) {
				// 本身的10001同步地址我选择不用
				if (uid == '10001') {
					return res.json({
						code:2,
						msg:'订单交易成功',
						url: returnUrl
					})
				} else {
					// 同步地址加参数验证更安全
					let returnUrls = returnUrl + '?sign=' + signs + '&callbackSign=' + callbackSign + '&orderUid=' + orderUid + '&orderNumber=' + orderNumber + '&orderName=' + orderName + '&status=' + status +'&payPrice=' +payPrice +'&price=' + price
					res.json({
						code : 2,
						msg : '订单交易成功',
						url : returnUrls // returnUrls
					})
				}
			}
			if (status === 1 || Status === -1) { //回调通知失败
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
						callbackSign,
						status: 1,
						orderName
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
						if (error) {
							console.log('errorData:' + error)
							console.log('errBody:' + body)
						}
						if (!error) {
							//异步回调成功
							if (body == 'SUCCESS' || body == ' SUCCESS') {
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
										let Money = money.toFixed(2)
										if (Money < 0) {
											res.json('账户余额不足')
										}
										User.updateOne({uid},{money:Money})
											.then( merchant=>{
												User.findOne({uid:'10001'})
													.then(admin=>{
														let money = parseFloat(admin.money) + parseFloat(fee)
														let Money = money.toFixed(2)
														User.updateOne({uid:'10001'},{money:Money})
															.then(Admin => {
															//升级status
															Order.updateMany( { orderNumber}, {status:2, payTime,expire:0})
																	.then(res.json({
																			code: 1,
																			msg: '交易成功'
																		}))
																	.catch(err => res.send('请联系客服!'))
															})
															.catch(err=>res.json('fee主账户增加失败'))
													})
													.catch(err => res.json('-fee-admin-find-err'))
											})
											.catch(err =>res.json('账户fee扣除失败'))
									})
									.catch('fee-no-user')
								} else {
								//升级status
								Order.updateMany( { orderNumber}, {status:2, payTime,expire:0})
										.then(order => {
											res.json({
												code: 1,
												msg: '交易成功'
											})
										})
										.catch(err => res.send('请联系客服!'))
								}
							} else {
								console.log(body)
							}
						}
					})
				} else {
					res.send({
						code: 1,
						msg: '订单支付成功，回调失败'
					})
				}
			}	
		})
		.catch( err => res.send('query-order-failed'))
})

router.get('/server/api/alipayS', (req, res)=>{
	let { uid, orderNumber } = req.query
	Order.findOne({uid, orderNumber})
	     .then(order => {
			 if (order && order.status == -1) {
				 let { payType, price, orderUid, orderName, orderNumber, returnUrl, notifyUrl, signs, uid } = order
				 res.render('post.html', {
                    payType, price, orderUid, orderName, orderNumber, returnUrl, notifyUrl, sign:signs, uid
				 })
			 } else {
				 res.json('网关错误notFindOrder')
			 }
		 })
		 .catch(err => res.json('网关错误' + err))
})

// h5跳转
router.get('/server/api/alipayH5', (req, res)=>{
	let { u, a } = req.query
	// 判断浏览器
	let deviceAgent = req.headers["user-agent"].toLowerCase()
    let agentID = deviceAgent.match(/(alipay)/)
	if (agentID) {
		let h5Url ='https://render.alipay.com/p/s/i/?scheme='+encodeUrl('alipays://platformapi/startapp?appId=20000123&actionType=scanAndRoute&qrcode=alipays://platformapi/startapp?appId=20000123&actionType=scan&biz_data={"s":"money","u":"'+u+'","a":"'+a+'","m":""}')
	res.redirect(h5Url)
	} else {
		res.send('系统繁忙')
	}
})

// 扫码风控
router.get('/server/api/alipay', (req, res)=>{
	let { u, a } = req.query
	// 判断浏览器
	let deviceAgent = req.headers["user-agent"].toLowerCase()
    let agentID = deviceAgent.match(/(alipay)/)
	if (agentID) {
	   res.render('alipayIn.html',{
		   u,a,m:Math.random()
	})
	} else {
		res.send('系统繁忙')
	}
})
module.exports = router
