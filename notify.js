let Order = require('./models/Orders')
let User = require('./models/Users')
let request = require('request')
let schedule = require('node-schedule')
process.on('message', (remoteData) => {
	let rule = new schedule.RecurrenceRule()
	    rule.second = 30
		let j = schedule.scheduleJob(rule, function(){
		  request({
			url: remoteData.notify_url,
			method: "POST",
			json: true,
			headers: {
				"content-type": "application/json",
			},
			body: remoteData
		}, (error, response, body) => {
			if (!error && response.statusCode == 200) {
				//异步回调成功
				if (body === 'SUCCESS') {
					let date = new Date()
					let YearMD = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')} `
					let HoursMS = `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}:${date.getSeconds().toString().padStart(2,'0')}`
					let pay_time = YearMD + HoursMS
					try {
						process.kill(remoteData.Pid,'SIGTERM')
					} catch(e) {
						console.log(e)
					}
					//fee扣除 和fee计算
					if (remoteData.uid !== '10001') {
						User.findOne({uid:remoteData.uid})
						.then(merchant =>{
							let money = parseFloat(merchant.money) - parseFloat(remoteData.fee)
							let Money = money.toFixed(2, '0')
							if (Money < 0) {
								console.log('商户余额不足')
							}
							User.updateOne({uid:remoteData.uid},{money:Money})
								.then( merchant=>{
									User.findOne({uid:'10001'})
										.then(admin=>{
											let money = parseFloat(admin.money) + parseFloat(remoteData.fee)
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
				    try {
						  return process.kill(remoteData.pid,'SIGTERM')		 
						} catch (e) {
							return console.log(e)
					}
					//升级status
					Order.updateMany( { orderNumber:remoteData.orderNumber}, {status:2, pay_time,expire:0})
						 .then()
						 .catch(err => res.send('请联系客服!'))
				}
			}
		})
		})
})