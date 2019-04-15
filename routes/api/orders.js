const express = require('express')
const router = express.Router()
const Order = require('../../models/Orders')
const MissOrder = require('../../models/MissOrders') 
const Tools = require('../../config/utils')
// 引用工具
let tools = new Tools()
router.get('/order/getOrder',(req, res)=>{
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
			  return tools.localDate(v)
		    })
            let start = trueDate[0]
		    let end = trueDate[1]
            if ( start && end ) {
				query.createTime = {$gte:start,$lt:end}
			}		
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
		if (phoneId) {
			query.phoneId = phoneId
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

router.get('/order/getMissOrder',(req, res)=>{
  try {  
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
			  return tools.localDate(v)
		    })
            let start = trueMissDate[0]
		    let end = trueMissDate[1]
            if ( start && end ) {
				query.createTime = {$gte:start,$lt:end}
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
router.get('/order/getDayMoney', async (req, res)=>{
try {
    let { uid,role } = req.query
    let date = new Date()
	    date.setHours(0)
		date.setSeconds(0)
		date.setMinutes(0)
        let now = tools.localDate(date)
        date.setDate(date.getDate()-1)
        let yes = tools.localDate(date)
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
        const sum = (property,arr) => {
            let s = 0
            arr.forEach(e => {
                s += parseFloat(e[property])
            })
            return parseFloat(s)
        }
        if (role === 'admin') {
            // 今日交易额数据
            let tod_ali_success_order = await getDayMoney('alipay','',{$gte:now})
            let tod_ali = sum('payPrice',tod_ali_success_order).toFixed(2,'0')
            let tod_ali_fee = sum('fee',tod_ali_success_order).toFixed(3,'0')
            let tod_wx_success_order = await getDayMoney('wxpay','',{$gte:now})
            let tod_wx_fee = sum('fee',tod_wx_success_order).toFixed(3,'0')
            let tod_wx = sum('payPrice',tod_wx_success_order).toFixed(2,'0')
            let tod_all = (parseFloat(tod_ali) + parseFloat(tod_wx)).toFixed(2, '0')
            let tod_all_fee = (parseFloat(tod_ali_fee) + parseFloat(tod_wx_fee)).toFixed(3, '0')
            // 昨日交易额数据
            let yes_ali_success_order = await getDayMoney('alipay','',{$gte:yes,$lt:now})
            let yes_ali = sum('payPrice',yes_ali_success_order).toFixed(2,'0')
            let yes_ali_fee = sum('fee',yes_ali_success_order).toFixed(3,'0')
            let yes_wx_success_order = await getDayMoney('wxpay','',{$gte:yes,$lt:now})
            let yes_wx = sum('payPrice',yes_wx_success_order).toFixed(2,'0')
            let yes_wx_fee = sum('fee',yes_wx_success_order).toFixed(3,'0')
            let yes_all = (parseFloat(yes_ali) + parseFloat(yes_wx)).toFixed(2, '0')
            let yes_all_fee = (parseFloat(yes_ali_fee) + parseFloat(yes_wx_fee)).toFixed(3, '0')

            // 平台总交易额
            let all_ali_success_order = await getDayMoney('alipay','','')
            let all_ali = sum('payPrice', all_ali_success_order).toFixed(2,'0')
            let all_ali_fee = sum('fee',all_ali_success_order).toFixed(3,'0')
            let all_wx_success_order = await getDayMoney('wxpay','','')
            let all_wx = sum('payPrice',all_wx_success_order).toFixed(2,'0')
            let all_wx_fee = sum('fee',all_wx_success_order).toFixed(3,'0')
            let all_all = (parseFloat(all_ali) + parseFloat(all_wx)).toFixed(2, '0')
            let all_all_fee = (parseFloat(all_ali_fee) + parseFloat(all_wx_fee)).toFixed(3, '0')
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
    }       
            let tod_ali_success_order = await getDayMoney('alipay',uid,{$gte:now})
            let tod_ali = sum('payPrice',tod_ali_success_order).toFixed(2,'0')
			let tod_ali_fee = sum('fee',tod_ali_success_order).toFixed(3,'0')
            let tod_wx_success_order = await getDayMoney('wxpay',uid,{$gte:now})
            let tod_wx = sum('payPrice',tod_wx_success_order).toFixed(2,'0')
			let tod_wx_fee = sum('fee',tod_wx_success_order).toFixed(3,'0')
            let tod_all = (parseFloat(tod_ali) + parseFloat(tod_wx)).toFixed(2, '0')
			let tod_all_fee = (parseFloat(tod_ali_fee) + parseFloat(tod_wx_fee)).toFixed(3, '0')

            let yes_ali_success_order = await getDayMoney('alipay',uid,{$gte:yes,$lt:now})
            let yes_ali = sum('payPrice', yes_ali_success_order).toFixed(2,'0')
			let yes_ali_fee = sum('fee',yes_ali_success_order).toFixed(3,'0')
            let yes_wx_success_order = await getDayMoney('wxpay',uid,{$gte:yes,$lt:now})
            let yes_wx = sum('payPrice',yes_wx_success_order).toFixed(2,'0')
			let yes_wx_fee = sum('fee',yes_wx_success_order).toFixed(3,'0')
            let yes_all = (parseFloat(yes_ali) + parseFloat(yes_wx)).toFixed(2, '0')
			let yes_all_fee = (parseFloat(yes_ali_fee) + parseFloat(yes_wx_fee)).toFixed(3, '0')

            let all_ali_success_order = await getDayMoney('alipay',uid,'')
            let all_ali = sum('payPrice', all_ali_success_order).toFixed(2,'0')
			let all_ali_fee = sum('fee',all_ali_success_order).toFixed(3,'0')
            let all_wx_success_order = await getDayMoney('wxpay',uid,'')
            let all_wx = sum('payPrice',all_wx_success_order).toFixed(2,'0')
            let all_wx_fee = sum('fee',all_wx_success_order).toFixed(3,'0')
            let all_all = (parseFloat(all_ali) + parseFloat(all_wx)).toFixed(2, '0')
			let all_all_fee = (parseFloat(all_ali_fee) + parseFloat(all_wx_fee)).toFixed(3, '0')
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
                    all_ali_fee
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

router.get('/order/getOrderNumber', async (req, res)=>{
try {
    let { uid,role } = req.query
    let date = new Date()
	    date.setHours(0)
		date.setSeconds(0)
		date.setMinutes(0)
        let now = tools.localDate(date)
        date.setDate(date.getDate()-1)
        let yes = tools.localDate(date)
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
        let today_success_order = await getOrderNumber(2,'',{$gte:now})
        let today_no_order = await getOrderNumber(1,'',{$gte:now})
        let today_all_order = await getOrderNumber('','',{$gte:now})
        let yes_success_order = await getOrderNumber(2,'',{$gte:yes,$lt:now})
        let yes_no_order = await getOrderNumber(1,'',{$gte:yes,$lt:now})
        let yes_all_order = await getOrderNumber('','',{$gte:yes,$lt:now})
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
        let today_success_order = await getOrderNumber(2,uid,{$gte:now})
        let today_no_order = await getOrderNumber(1,uid,{$gte:now})
        let today_all_order = await getOrderNumber('',uid,{$gte:now})
        let yes_success_order = await getOrderNumber(2,uid,{$gte:yes,$lt:now})
        let yes_no_order = await getOrderNumber(1,uid,{$gte:yes,$lt:now})
        let yes_all_order = await getOrderNumber('',uid,{$gte:yes,$lt:now})
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