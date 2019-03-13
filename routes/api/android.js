const express = require('express')
const router = express.Router()
const Tools = require('../../config/utils')
const Order = require('../../models/Orders')
const User = require('../../models/Users')
const MissOrder = require('../../models/MissOrders')
const bcrypt = require('bcrypt')
const request = require('request')
// 引用工具
const tools = new Tools()
// 安卓客户端回调
router.get('/server/api/updateOrder',(req, res)=>{
    let { price, sign, type, e ,p} = req.query
    if(tools.md5(tools.md5(price + type) + p) === sign) {
        User.findOne( {email:e} )
            .then( user => {
                if (!user) {
                    return res.json({
                        code:-1,
                        msg:'您的邮箱未注册!'
                    })
                }
                bcrypt.compare(p, user.password)
                // 比较密码 返回isMatch 错误正确
                        .then(isMatch=>{
                                if (isMatch) {
                                    if (type === 'wechat') {
                                        type = 'wxpay'
                                    }
                                    Order.find({ uid:user.uid, pay_price: price, payType: type, status: -1 ,expire: { $gt: 0, $lt: 300 }})
                                         .then(order=> {
											 console.log(order)
											    let { pay_price, price ,payType,orderName, orderUid , orderNumber, sign1, sign2, notify_url,status, return_url, uid, expire,fee, pid} = order[0]
                                                Order.updateOne({orderNumber,uid,pay_price,payType }, { status : 1 })
                                                     .then(successOrder=>{		 
														 // 异步通知
													let requestData = {
														orderUid,
														pay_price,
														orderNumber,
														sign1,
														price,
														sign2
													}
														request({
															url: notify_url,
															method: "POST",
															json: true,
															headers: {
																"content-type": "application/json",
															},
															body: requestData
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
																	Order.updateMany( { orderNumber}, {status:2, pay_time,expire:0})
																		 .then()
																		 .catch(err => res.send('请联系客服!'))
																} else {
																	const childProcess = require('child_process')
										                            let childNotify = childProcess.fork('./notify.js')
																	requestData.pid = childNotify.pid
																	requestData.notify_url = notify_url
																	requestData.Pid = pid
																    requestData.uid = uid
																	requestData.fee = fee
																	Order.updateOne({orderNumber, uid},{Pid:childNotify.pid})
																	     .then()
																		 .catch(err => res.json('Pid-insert-err'))
																	childNotify.send(requestData)
																}
															}
														})
													 })
                                                     .catch(err => res.json('android-update-order-err,请联系客服'))
                                                })
												// 未匹配订单
                                         .catch( err => {
											 let missOrder = new MissOrder({
												 uid:user.uid,
												 pay_price:price,
												 payType:type,
												 createTime:tools.localDate()
											 })
											 missOrder.save()
											          .then()
													  .catch( err => res.json('missOrder-save-error'))
										 })
                                } else {
                                    res.json({
                                        code:'-1',
                                        msg:'收款失败请检查您的账户密码'
                                    })
                                } 
                            })
            })
            .catch(err=>('email-error'))
    }
})
// 安卓客户端登陆验证
router.get('/server/api/setting',(req, res)=>{
    let { apiurl, secretkey, sign } = req.query
    if (tools.md5(tools.md5(apiurl) + secretkey) == sign) {
        User.findOne( {email:apiurl} )
            .then( user => {
                if (!user) {
                    return res.json({
                        code:-1,
                        msg:'您的邮箱未注册!'
                    })
                }
                bcrypt.compare(secretkey, user.password)
                // 比较密码 返回isMatch 错误正确
                        .then(isMatch=>{
                                if (isMatch) {
                                        res.send({
                                            code : 1,
                                            msg: '登陆成功',
                                            data: '',
                                            url: '',
                                            wait: 3
                                        })  
                                } else {
                                    res.json({
                                        code:'-1',
                                        msg:'密码错误!'
                                    })
                                } 
                            })
            })
            .catch(err=>('email-error'))
    }
})

module.exports = router