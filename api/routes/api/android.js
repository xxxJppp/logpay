const express = require('express')
const router = express.Router()
const Tools = require('../../utils/utils')
const Order = require('../../models/Orders')
const User = require('../../models/Users')
const MissOrder = require('../../models/MissOrders')
const bcrypt = require('bcrypt')
const request = require('request')
const passport = require('passport')
// 引用工具
let tools = new Tools()
let { md5, localDate } = tools
// 安卓客户端回调
router.get('/server/api/updateOrder',(req, res)=>{
    let { price, sign, type, e ,p} = req.query
    if(md5(md5(price + type) + p) === sign) {
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
                                    Order.find({ uid:user.uid, payPrice: price, payType: type, status: -1 ,expire: { $gt: 0, $lt: 300 }})
                                         .then(order=> {
											    let { payPrice, price ,payType,orderName, orderUid , orderNumber, signs, callbackSign, notifyUrl,status, returnUrl, uid, expire,fee, pid} = order[0]
                                                Order.updateOne({orderNumber,uid,payPrice,payType }, { status : 1 })
                                                     .then(successOrder=>{	 
														 // 异步通知
													let requestData = {
														orderUid,
														payType,
														payPrice,
														orderNumber,
														sign:signs,
														price,
														callbackSign
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
																console.log(error)
															    console.log(body)
															}
															if (!error) {
																//异步回调成功
																if (body === 'SUCCESS' || body == ' SUCCESS') {
																	let date = new Date()
																	let YearMD = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')} `
																	let HoursMS = `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}:${date.getSeconds().toString().padStart(2,'0')}`
																	let payTime = YearMD + HoursMS
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
																						        .then( Admin =>{
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
																} else {
																	console.log(body)
																	const childProcess = require('child_process')
										                            let childNotify = childProcess.fork('./notify.js')
																	requestData.Pid = childNotify.pid
																	requestData.notifyUrl = notifyUrl
																	requestData.pid = pid
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
												 payPrice:price,
												 payType:type,
												 createTime:localDate()
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
	console.log(req.query)
    if (md5(md5(apiurl) + secretkey) == sign) {
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