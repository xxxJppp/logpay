const express = require('express')
const router = express.Router()
const Tools = require('../../utils/utils')
const core = require('../../function/coreFunc')
//引用 mongodb
const Order = require('../../models/Orders')
const Qrcode = require('../../models/Qrcodes')
const User = require('../../models/Users')
const Meal = require('../../models/Meals')
const PhoneId = require('../../models/PhoneIds')
const request = require('request')
const passport = require('passport')
		let urlencode = require('urlencode')
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
	//获取html页面
	const showHtml = (payType, uid, phoneId, price, payPrice, orderNumber, expire, createTime) => {
		createTime = createTime.substring(0, 10) + ' ' + createTime.substring(11, 19)
		if (payType === 'alipay') {
			PhoneId.findOne({uid, id:phoneId})
				.then( phone =>{
					if (!phone) {
						return false
					}
					// 如果没有useid
					if(phone.userid) {
						let alipayCodeUrl = 'alipays://platformapi/startapp?appId=20000123&actionType=scan&biz_data={"s":"money","u":"'+ phone.userid +'","a":"'+payPrice+'","m":""}'
						res.render('alipay.html',{
							    createTime:createTime,
								money: payPrice,
								price: price,
								payPrice: payPrice,
								orderNumber: orderNumber,
								codeUrl: alipayCodeUrl,
								expire: expire,
								uid:uid,
								goAlipay: 'alipays:plantformapi'
							})
						} else {
						Qrcode.findOne({price:payPrice, phoneId, uid, type:'支付宝'})
								.then( qrcode =>{
									if (!qrcode) {
										Qrcode.findOne({price:'不固定金额', uid, phoneId, type:'支付宝'})
											.then( code =>{
												res.render('alipay.html',{
												createTime:createTime,
												money: '请手动输入 '+ payPrice,
												price: price,
												payPrice: payPrice,
												orderNumber: orderNumber,
												codeUrl: code.payUrl,
												expire: expire,
												uid:uid,
												goAlipay: 'alipays:plantformapi'
											})
											})
											.catch(err => res.json('配置错误!请您配置支付宝不固定额收款码!'))
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
							})
							.catch(err => res.json('配置错误!请您配置微信不固定额收款码!'))
					} else {
					res.render('wxpay.html',{
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
				})
				.catch( err =>res.json('wx-qr-find-error'))
	}
	}
	// 判断手机还是电脑
	let deviceAgent = req.headers["user-agent"].toLowerCase()
    let agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/)
	let { uid, price, orderNumber, payType, notifyUrl, returnUrl, sign, orderUid, orderName, ip } = req.body
	console.log(req.body)
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
	if (payType === 'alipayf2f') {
	 if (sign === signs) {
		let urlencode = require('urlencode')
		async function orderNumberFindF2f (orderNumber) {
        return new Promise((resolve, reject)=>{
            Order.findOne({orderNumber})
                 .then(order => resolve(order))
                 .catch(err => reject(err))
        })
		}
		let o = await orderNumberFindF2f(orderNumber).catch(err => { return res.json(err)})
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
					let h5Url = 'https://render.alipay.com/p/s/i?scheme=' + encodeUrl( 'alipays://platformapi/startapp?saId=10000007&qrcode=' + encodeUrl(o.qrCode + '?_s=web-other'))
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
			if(result.code != 10000) {
				return res.send("支付宝网关返回错误, 请联系客服")
			}
			let { outTradeNo, qrCode, msg, code } = result
            // 出码
			if (code == 10000 && msg == 'Success' && orderNumber === outTradeNo) {
				let h5Url = 'https://render.alipay.com/p/s/i?scheme=' + encodeUrl( 'alipays://platformapi/startapp?saId=10000007&qrcode=' + encodeUrl(qrCode + '?_s=web-other'))
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
						let sortOrder = await priceSort(uid, price, payType).catch(err => { return res.json(err)})
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
							payPrice = mathTest(expireArr2)
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
						let successSave = await orderSave(order).catch(err => { return res.json(err)})
						if (successSave) {
							childTimer.send({
								orderNumber,
								expire,
								pid
							})
							showHtml(payType, uid, phoneId, price, payPrice, orderNumber, expire, createTime)						
						}
					} else {
						res.json('签名错误!')
				    }
			} else {
				let { phoneId, uid, payPrice, price, payType, orderNumber, expire, createTime} = existOrder
				showHtml(payType, uid, phoneId, price, payPrice, orderNumber, expire, createTime.toISOString())
			}
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
				if (uid == '10001') {
					return res.json({
						code:2,
						msg:'订单交易成功',
						url: returnUrl
					})
				} else {
					// 同步地址加参数验证更安全
					let returnUrls = returnUrl + '?sign=' + signs + '&callbackSign=' + callbackSign + '&orderUid=' + orderUid + '&orderNumber=' + orderNumber + '&orderName=' + orderName + '$status=' + status +'&payPrice='+payPrice +'&price=' + price + '&ip=' + getClientIP(req)
					res.json({
						code : 2,
						msg : '订单交易成功',
						url : returnUrls // returnUrls
					})
				}
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
															.then(Admin => {
															   //升级status
															   Order.updateMany( { orderNumber}, {status:2, payTime,expire:0})
																	.then()
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
										.then()
										.catch(err => res.send('请联系客服!'))
								}
							}
						}
					})
				}
            }	
         })
         .catch( err => res.send('query-order-failed'))
})

router.get('/server/api/alipay', (req, res)=>{
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


module.exports = router
