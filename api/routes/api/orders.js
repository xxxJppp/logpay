const express = require('express')
const router = express.Router()
const Order = require('../../models/Orders')
const MissOrder = require('../../models/MissOrders')
const PhoneId = require('../../models/PhoneIds')
const Tools = require('../../utils/utils')
const passport = require('passport')
// 引用工具
let tools = new Tools()
let { localDate } = tools
// 获取订单
router.get('/order/getOrder', passport.authenticate("jwt",{session:false}), (req, res)=>{
  try {
        let params = req.query
        let orderNumber = params.orderNumber
        let orderUid = params.orderUid
        let status = params.status
        let payType = params.payType
		let orderDate = params.orderDate
		let merchantUid = params.merchantUid
		let role = params.role
        let uid = params.uid
        let phoneId = params.phoneId
		let query = {}
		if (orderDate) {
			let trueDate = orderDate.map(v=>{
			  return localDate(v)
		    })
            let start = trueDate[0]
		    let end = trueDate[1]
            if ( start && end ) {
				query.createTime = {$gt:start,$lte:end}
			}		
        }
        if (phoneId) {
            query.phoneId = phoneId
        }
        if (orderNumber) {
           query.orderNumber = orderNumber           
        }
        if (orderUid) {
            query.orderUid = orderUid           
        }
        if (status) {
            query.status = status       
        }
        if (payType) {
            query.payType = payType        
        }
        if (role === 'admin') {
			if (merchantUid) {
            query.uid = merchantUid
			}			
		}
		if (role === 'merchant'){
			query.uid = uid
		}
         Order.find(query)
		      .sort({'_id':-1})
              .then( order =>{
                 let skip = (parseInt(params.page-1))*parseInt(params.num)
                 let limit = parseInt(params.num)
                 Order.find(query)
                      .sort({'_id':-1})
                      .skip(skip)
                      .limit(limit) 
                      .exec()
                      .then( select => {
                        if (!select) throw ('无数据!')
                        res.json({
                          code: 1,
                          data: {
                              select,
                              order
                          },
                          msg: '获取成功!'
                      })
                    })
                      .catch( err => res.json('当前系统繁忙'))
              })
              .catch( err => res.json('当前系统繁忙'))
            } catch (e) {
                res.json({
                    code:-1,
                    data:'',
                    msg:e
                })
            }
})

// 获取未匹配订单
router.get('/order/getMissOrder', passport.authenticate("jwt",{session:false}), (req, res)=>{
  try {  
        console.log(req.query)
        let params = req.query
        let payType = params.payType
		let missOrderDate = params.missOrderDate
		let payPrice = params.payPrice
		let merchantUid = params.merchantUid
		let role = params.role
		let uid = params.uid
		let query = {}
		if (payPrice) {
            query.payPrice = payPrice           
        }
		if (missOrderDate) {
			let trueMissDate = missOrderDate.map(v=>{
			  return localDate(v)
		    })
            let start = trueMissDate[0]
		    let end = trueMissDate[1]
            if ( start && end ) {
				query.createTime = {$gt:start,$lte:end}
			}			
		}
        if (payType) {
            query.payType = payType           
        }
		if (role === 'admin') {
			if (merchantUid) {
            query.uid = merchantUid
			}			
		}
		if (role === 'merchant'){
			query.uid = uid
		}
        MissOrder.find(query)
		         .sort({'_id':-1})
                 .then( missOrder =>{
                 let skip = (parseInt(params.page-1))*parseInt(params.num)
                 let limit = parseInt(params.num)
             MissOrder.find(query)
                      .sort({'_id':-1})
                      .skip(skip)
                      .limit(limit) 
                      .exec()
                      .then( select => {
                        if (!select) throw ('无数据!')
                        res.json({
                          code: 1,
                          data: {
                              select,
                              missOrder
                          },
                          msg: '获取成功!'
                      })
                    })
                      .catch( err => res.json('当前系统繁忙'))
                 })
                 .catch( err => res.json('当前系统繁忙'))
            } catch (e) {
                res.json({
                    code:-1,
                    data:'',
                    msg:e
                })
            }
})
// 获取钱
router.get('/order/getDayMoney', passport.authenticate("jwt",{session:false}), async (req, res)=>{
try {
    let { uid,role } = req.query
    let date = new Date()
	    date.setHours(0)
		date.setSeconds(0)
		date.setMinutes(0)
        let now = localDate(date)
        date.setDate(date.getDate()-1)
        let yes = localDate(date)
        const getDayMoney = (payType,uid, time) => {
        return new Promise((resolve, reject)=>{
            let select = {}
            if (payType) {
                select.payType = payType
            }
            if (uid) {
                select.uid = uid
            }
            if (time) {
                select.createTime = time
            }
            select.status = 2
            Order.find(select)
             .then( order=>{
                 resolve(order)
             })
             .catch( err => reject(err))
        })
        }
		// 获取商户手机列表
		const getPhoneIds = (uid) => {
        return new Promise((resolve, reject)=>{
            PhoneId.find({uid})
             .then( phone =>{
                 resolve(phone.map(v =>{
					 return v.id
				 }))
             })
             .catch( err => reject(err))
        })
        }
		// 获取商户手机各订单列表
		const getPhoneIdsOrderArr = (phone, order) =>{
			return new Promise((resolve, reject)=>{
				phone.forEach(p =>{
					// 组成订单
						resolve(order.filter( v=>{
						return v.phoneId == p
					}))
				})
			})
		}
        const sum = (property,arr) => {
            let s = 0
            arr.forEach(e => {
                s += parseFloat(e[property])
            })
            return parseFloat(s)
        }
		// 手机详细费用
		const getPhoneIdsMoneyArr = (dayType, all_success_order, ali_success_order, wx_success_order) => {
            let tod_arr = []
			for (let i = 0; i < phoneIds.length; i++) {
				let p = phoneIds[i]
				let all_phoneId_order = all_success_order.filter( v=>{
					return v.phoneId == p
				})
				let ali_phoneId_order = ali_success_order.filter( v=>{
					return v.phoneId == p
				})
				let wx_phoneId_order = wx_success_order.filter( v=>{
					return v.phoneId == p
				})
				let all_phoneId_money = sum('payPrice', all_phoneId_order).toFixed(2)
				let ali_phoneId_money = sum('payPrice', ali_phoneId_order).toFixed(2)
				let wx_phoneId_money = sum('payPrice', wx_phoneId_order).toFixed(2)
				let tod_yes = ''
				if(dayType == 'tod') {
					tod_yes = '今手机'+p+'交易额'
				} else if(dayType == 'yes') {
					tod_yes = '昨手机'+p+'交易额'
				} else if(dayType == 'all') {
					tod_yes = '总手机'+p+'交易额'
				}
				tod_arr.push({tod_yes, all:all_phoneId_money, ali:ali_phoneId_money, wx:wx_phoneId_money})
			}
            return tod_arr		
		}
        if (role === 'admin') {
            // 今日交易额数据
            let tod_ali_success_order = await getDayMoney('alipay','',{$gt:now})
            let tod_ali = sum('payPrice',tod_ali_success_order).toFixed(2)
            let tod_ali_fee = sum('fee',tod_ali_success_order).toFixed(3)
            let tod_wx_success_order = await getDayMoney('wxpay','',{$gt:now})
            let tod_wx_fee = sum('fee',tod_wx_success_order).toFixed(3)
            let tod_wx = sum('payPrice',tod_wx_success_order).toFixed(2)
            let tod_all = sum('payPrice', await getDayMoney('','',{$gt:now})).toFixed(2)
            let tod_all_fee = sum('fee', await getDayMoney('','',{$gt:now})).toFixed(3)
			
            // 昨日交易额数据
            let yes_ali_success_order = await getDayMoney('alipay','',{$gt:yes,$lte:now})
            let yes_ali = sum('payPrice',yes_ali_success_order).toFixed(2)
            let yes_ali_fee = sum('fee',yes_ali_success_order).toFixed(3)
            let yes_wx_success_order = await getDayMoney('wxpay','',{$gt:yes,$lte:now})
            let yes_wx = sum('payPrice',yes_wx_success_order).toFixed(2)
            let yes_wx_fee = sum('fee',yes_wx_success_order).toFixed(3)
            let yes_all = sum('payPrice', await getDayMoney('','',{$gt:yes,$lte:now})).toFixed(2)
            let yes_all_fee = sum('fee', await getDayMoney('','',{$gt:yes,$lte:now})).toFixed(3)

            // 平台总交易额
            let all_ali_success_order = await getDayMoney('alipay','','')
            let all_ali = sum('payPrice', all_ali_success_order).toFixed(2)
            let all_ali_fee = sum('fee',all_ali_success_order).toFixed(3)
            let all_wx_success_order = await getDayMoney('wxpay','','')
            let all_wx = sum('payPrice',all_wx_success_order).toFixed(2)
            let all_wx_fee = sum('fee',all_wx_success_order).toFixed(3)
            let all_all = sum('payPrice', await getDayMoney('','','')).toFixed(2)
            let all_all_fee = sum('fee', await getDayMoney('','','')).toFixed(3)
            return res.json({
                code:1,
                data:{
                    tod_wx,
                    tod_ali,
                    tod_all,
                    tod_wx_fee,
                    tod_all_fee,
                    tod_ali_fee,
                    yes_wx,
                    yes_ali,
                    yes_all,
                    yes_wx_fee,
                    yes_all_fee,
                    yes_ali_fee,
                    all_wx,
                    all_ali,
                    all_all,
                    all_wx_fee,
                    all_all_fee,
                    all_ali_fee
                }
            })
    }       // 获取商户手机列表数组
			let phoneIds = await getPhoneIds(uid)
			let tod_all_success_order = await getDayMoney('', uid, {$gt:now})
            let tod_ali_success_order = await getDayMoney('alipay', uid, {$gt:now})
            let tod_ali = sum('payPrice',tod_ali_success_order).toFixed(2)
			let tod_ali_fee = sum('fee',tod_ali_success_order).toFixed(3)
            let tod_wx_success_order = await getDayMoney('wxpay',uid,{$gt:now})
            let tod_wx = sum('payPrice',tod_wx_success_order).toFixed(2)
			let tod_wx_fee = sum('fee',tod_wx_success_order).toFixed(3)
            let tod_all = sum('payPrice', await getDayMoney('',uid,{$gt:now})).toFixed(2)
            let tod_all_fee = sum('fee', await getDayMoney('',uid,{$gt:now})).toFixed(3)
			let todPhoneIdsArr = getPhoneIdsMoneyArr('tod',tod_all_success_order, tod_ali_success_order, tod_wx_success_order)
			
			let yes_all_success_order = await getDayMoney('', uid, {$gt:yes,$lte:now})
            let yes_ali_success_order = await getDayMoney('alipay',uid,{$gt:yes,$lte:now})
            let yes_ali = sum('payPrice', yes_ali_success_order).toFixed(2)
			let yes_ali_fee = sum('fee',yes_ali_success_order).toFixed(3)
            let yes_wx_success_order = await getDayMoney('wxpay',uid,{$gt:yes,$lte:now})
            let yes_wx = sum('payPrice',yes_wx_success_order).toFixed(2)
			let yes_wx_fee = sum('fee',yes_wx_success_order).toFixed(3)
            let yes_all = sum('payPrice', await getDayMoney('', uid,{$gt:yes,$lte:now})).toFixed(2)
            let yes_all_fee = sum('fee', await getDayMoney('', uid,{$gt:yes,$lte:now})).toFixed(3)
			let yesPhoneIdsArr = getPhoneIdsMoneyArr('yes', yes_all_success_order, yes_ali_success_order, yes_wx_success_order)
			
			let all_all_success_order = await getDayMoney('',uid,'')
            let all_ali_success_order = await getDayMoney('alipay',uid,'')
            let all_ali = sum('payPrice', all_ali_success_order).toFixed(2)
			let all_ali_fee = sum('fee',all_ali_success_order).toFixed(3)
            let all_wx_success_order = await getDayMoney('wxpay',uid,'')
            let all_wx = sum('payPrice',all_wx_success_order).toFixed(2)
            let all_wx_fee = sum('fee',all_wx_success_order).toFixed(3)
            let all_all = sum('payPrice', await getDayMoney('',uid,'')).toFixed(2)
            let all_all_fee = sum('fee', await getDayMoney('',uid,'')).toFixed(3)
			let allPhoneIdsArr = getPhoneIdsMoneyArr('all', all_all_success_order, all_ali_success_order, all_wx_success_order)
			let phoneIdsArr = todPhoneIdsArr.concat(yesPhoneIdsArr).concat(allPhoneIdsArr)
            res.json({
                code:1,
                data:{
					tod_wx,
                    tod_ali,
                    tod_all,
                    tod_wx_fee,
                    tod_all_fee,
                    tod_ali_fee,
                    yes_wx,
                    yes_ali,
                    yes_all,
                    yes_wx_fee,
                    yes_all_fee,
                    yes_ali_fee,
                    all_wx,
                    all_ali,
                    all_all,
                    all_wx_fee,
                    all_all_fee,
                    all_ali_fee,
					phoneIdsArr
                }
            })
} catch (e) {
	res.json({
		code:-1,
		data:'',
		msg:e
	})
}
})

router.get('/order/getOrderNumber', passport.authenticate("jwt",{session:false}), async (req, res)=>{
try {
    let { uid,role } = req.query
    let date = new Date()
	    date.setHours(0)
		date.setSeconds(0)
		date.setMinutes(0)
        let now = localDate(date)
        date.setDate(date.getDate()-1)
        let yes = localDate(date)
        const getOrderNumber = (status, uid, time) => {
        return new Promise((resolve, reject)=>{
            let select = {}
            if (uid) {
                select.uid = uid
            }
            if (status) {
                select.status = status
            }
            if (time) {
                select.createTime = time              
            }
            Order.find(select)
             .then( order=>{
                 resolve(order)
             })
             .catch( err => reject(err))
        })
        }
    if (role === 'admin') {
        let today_success_order = await getOrderNumber(2,'',{$gt:now})
        let today_no_order = await getOrderNumber(1,'',{$gt:now})
        let today_all_order = await getOrderNumber('','',{$gt:now})
        let yes_success_order = await getOrderNumber(2,'',{$gt:yes,$lte:now})
        let yes_no_order = await getOrderNumber(1,'',{$gt:yes,$lte:now})
        let yes_all_order = await getOrderNumber('','',{$gt:yes,$lte:now})
        let all_success_order = await getOrderNumber(2,'','')
        let all_no_order = await getOrderNumber(1,'','')
        let all_order = await getOrderNumber('','','')
        return res.json({
            code:1,
            data:{
                today_success_order,
                today_no_order,
                today_all_order,
                yes_success_order,
                yes_no_order,
                yes_all_order,
                all_success_order,
                all_no_order,
                all_order
            }
        })
    }
        let today_success_order = await getOrderNumber(2,uid,{$gt:now})
        let today_no_order = await getOrderNumber(1,uid,{$gt:now})
        let today_all_order = await getOrderNumber('',uid,{$gt:now})
        let yes_success_order = await getOrderNumber(2,uid,{$gt:yes,$lte:now})
        let yes_no_order = await getOrderNumber(1,uid,{$gt:yes,$lte:now})
        let yes_all_order = await getOrderNumber('',uid,{$gt:yes,$lte:now})
        let all_success_order = await getOrderNumber(2,uid,'')
        let all_no_order = await getOrderNumber(1,uid,'')
        let all_order = await getOrderNumber('',uid,'')
        res.json({
            code:1,
            data:{
                today_success_order,
                today_no_order,
                today_all_order,
                yes_success_order,
                yes_no_order,
                yes_all_order,
                all_success_order,
                all_no_order,
                all_order
            }
        })
} catch (e) {
	res.json({
		code:-1,
		data:'',
		msg:e
	})
}
})

module.exports = router