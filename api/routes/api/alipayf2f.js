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
let { localDate } = tools
// alipayf2f回调
router.post('/server/api/alipayF2fNotify',(req, res)=>{
  let { out_trade_no, buyer_pay_amount, trade_no,total_amount, trade_status} = req.body
  if (req.alipayf2f.verifyCallback(req.body) && trade_status === 'TRADE_SUCCESS') {
	Order.findOne({orderNumber:out_trade_no})
	     .then(order =>{
		    let { uid, signs, orderName, orderUid, price, orderNumber, payType, fee, notifyUrl, pid } = order
		Order.updateOne({orderNumber:out_trade_no}, { status : 1 })
				.then(successOrder=>{
					if (total_amount != price || out_trade_no != orderNumber) {
						return console.log(total_amount)
					}
						// 异步通知
					let requestData = {
						orderNumber:out_trade_no,
						callbackSign:signs,
						price,
						trade_no,
						orderName,
						orderUid,
						payType
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
							if (body === 'SUCCESS') {
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
								Order.updateMany( { orderNumber}, {status:2, payTime, expire:0})
										.then(order => res.send('SUCCESS'))
										.catch(err => res.send('请联系客服'))
								}
						}
					})
					})
					.catch(err => res.json('alipayf2f-update-order-err,请联系客服'))
					// 未匹配订单
				.catch( err => {
					let missOrder = new MissOrder({
						uid,
						payPrice:total_amount + '-' + out_trade_no,
						payType,
						createTime:localDate()
					})
					missOrder.save()
							.then()
							.catch( err => res.json('missOrder-save-error'))
				})
			
		})
		.catch(err => res.json('alipayf2f-notify-find-error'))
  }
})
module.exports = router