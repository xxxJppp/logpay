const Order = require('../models/Orders')
const PhoneId = require('../models/PhoneIds')
const User = require('../models/Users')
const Meal = require('../models/Meals')
// 获取套餐增加后的时间
const getTime = (time, month) => {
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
const mealTime = (mealtime) => {
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
module.exports = {
	// 获取商户信息
	getUserMeal (uid) {
	return new Promise((resolve, reject)=>{
		User.findOne({uid})
		.then(merchant => resolve(merchant))
		.catch(err=> reject('uid-meal-find-error ') + err)
	})
	},

	// mf
	getMfFee (price) {
	return new Promise((resolve, reject)=>{
		Meal.findOne({mealName:'mf'})
		.then(meal=>{
			if (meal) {
			let fee = price*meal.mealFee
			resolve(fee)									
			}
		})
		.catch(err => reject('meal-find-error ' + err))
	})
	},

	// bz, gj
	getPayFee (mealName, merchant, uid, price) {
	return new Promise((resolve, reject)=>{
		let fee
		Meal.findOne({ mealName })
			.then(meal=>{
				if (meal) {
					// 计算商户余额和套餐价格的差价
					let money = parseFloat(merchant.money) - parseFloat(meal.mealPrice)
					if(mealTime(merchant.mealtime)) {
						// 时间满足的可以走通道
						fee = price*meal.mealFee
						resolve(fee)
					} else if (!mealTime(merchant.mealtime) && merchant.renew && money > 0) {
						// 时间不满足, 但是开启自动续费，且续费的钱还够
						User.updateOne({uid},{money, mealtime:getTime(merchant.mealtime,1)})
							.then( merchant =>{
								fee = price*meal.mealFee
								resolve(fee)
							})
							.catch( err=> reject('renew-failed ' + err))
					} else if (!mealTime(merchant.mealtime) && merchant.renew && money < 0) {
						// 时间不满足，可续费，但是钱不够呀
						User.updateMany({ uid },{ mealtime:'-', meal:'mf' })
							.then( merchant => {
									Meal.findOne({mealName:'mf'})
										.then(meal=>{
											if (meal) {
											fee = price*meal.mealFee	
											resolve(fee)					
											}
										})
										.catch(err => reject('meal-find-error ' + err))
							})
							.catch(err=> reject('renew-failed-for-lack-money ' + err))
					} else if (!mealTime(merchant.mealtime) && !merchant.renew) {
						User.updateMany({uid},{mealtime:'-',meal:'mf'})
							.then( merchant => {
								Meal.findOne({mealName:'mf'})
									.then(meal=>{
										if (meal) {
										fee = price*meal.mealFee
										resolve(fee)											
										}
									})
									.catch(err => reject('meal-find-error ' + err))
							})
							.catch(err=> reject('renew-failed-for-norenew ' + err))
					}										
				}
			})
			.catch(err => reject('meal-find-error ' + err))
	})
	},

	// other
	getOtherFee (merchant, price) {
	return new Promise((resolve, reject)=>{
		Meal.findOne({mealName:merchant.meal})
		.then(meal=>{
			if (meal) {
			let fee = price*meal.mealFee
			resolve(fee)									
			}
		})
		.catch(err => reject('meal-find-error ' + err))
	})
	},

	// 分发给商户的手机
	getPhoneArr (uid) {
	return new Promise((resolve, reject)=>{
		PhoneId.find({uid, open:true})
		.then(phone => resolve(phone.map(v =>{
			return v.id
		})))
		.catch(err => reject(err))
	})
	},

	// 价格递变查询
	priceSort (uid, price, payType, orderNumber) {
	return new Promise((resolve, reject)=>{
	Order.find({ uid, price, payType, status: -1, orderNumber:{$ne: orderNumber},expire: { $gt: 0, $lte: 300 } })
		.then( order => resolve(order))
		.catch( err => reject('order-finduids-error ' + err))
	})
	},

	// 是否存在order
	orderFind (uid, orderUid, ip, payType, price) {
	return new Promise((resolve, reject)=>{
		Order.findOne({ uid, orderUid, ip, payType, price, status:-1, expire:{ $gt: 0, $lt: 300} })
				.then( order => {
					if (order) {
						resolve(order)
					} else {
						resolve(false)
					}
			})
				.catch(err => reject('order-find-core-err ' + err))
		})
	},

	// 得到随机的数组[i]
	rand (Min,Max) {
	let Range = Max - Min
	let Rand = Math.random()
	let num = Min + Math.round(Rand * Range) //四舍五入
	return num
	},

	// 判断前面的订单排序
	mathTest (arr, price) {
	for (let i = 0; i < arr.length; i++) {
	if( arr[i].payPrice != (parseFloat(price) - i*0.01).toFixed(2,'0')) {
	let payPrice = parseFloat(price) - 0.01*i
	return payPrice
	}
	}
	},
	// 根据订单号查询订单情况
	orderNumberFind (orderNumber, uid, orderUid, payType, price) {
	return new Promise((resolve, reject)=>{
		Order.findOne({ orderNumber, uid, orderUid, payType, price })
			.then(order => {
				if (order) {
					resolve(order)	 
				} else {
					resolve(false)
				}
			})
			.catch(err => reject('orderNumber-find-err ' + err))
	})
	},
	// 存入订单
	orderSave (order) {
		return new Promise((resolve, reject)=>{
			order.save()
				.then(order => resolve(true))
				.catch( err => reject('order-save-error ' + err))
		})
	}
}