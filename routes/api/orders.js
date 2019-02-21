const express = require('express')
const router = express.Router()
const Order = require('../../models/Orders') 

router.get('/order/getOrder',(req, res)=>{
  try {
        let params = req.query
        if (parseInt(params.page) != params.page && parseInt(params.num) != params.num) {
            throw ('参数有误!')
        }
        let orderNumber = params.orderNumber 
        let orderUid = params.orderUid
        let status = params.status
        let payType = params.payType
        let query = {}
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
        query.uid = params.uid
         Order.find(query)
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

router.get('/order/getDayMoney', async (req, res)=>{
    let { uid,backtime } = req.query
    let date = new Date()
        let now = `${date.getFullYear()}-${(date.getMonth()+1)}-${date.getDate()} 0:0:0`
        date.setDate(date.getDate()-1)
        let yes = `${date.getFullYear()}-${(date.getMonth()+1)}-${date.getDate()} 0:0:0`
        const getDayMoney = (payType,uid, time) => {
        return new Promise((resolve, reject)=>{
            let select = {}
            if (payType) {
                select.payType = payType
            }
            if (uid) {
                select.uid = uid
            }
            select.createTime = time
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
                if (e.orderName === 'LogPay账户充值' && e.uid === '10001' && property === 'fee') {
                    return
                }
                s += parseFloat(e[property])
            })
            return parseFloat(s)
        }
    if (backtime == 0) {
        if (uid==='10001') {
            let ali_success_order = await getDayMoney('alipay','',{$gte:now})
            let ali = sum('pay_price', ali_success_order).toFixed(2,'0')
            let ali_fee = sum('fee',ali_success_order).toFixed(3,'0')
            let wx_success_order = await getDayMoney('wxpay','',{$gte:now})
            let wx_fee = sum('fee',wx_success_order).toFixed(3,'0')
            let wx = sum('pay_price',wx_success_order).toFixed(2,'0')
            let all = (parseFloat(ali) + parseFloat(wx)).toFixed(2, '0')
            let all_fee = (parseFloat(ali_fee) + parseFloat(wx_fee)).toFixed(3, '0')
            return res.json({
                code:1,
                data:{
                    wx,
                    ali,
                    all,
                    wx_fee,
                    all_fee,
                    ali_fee
                }
            })
    }       
            let ali_success_order = await getDayMoney('alipay',uid,{$gte:now})
            let ali = sum('pay_price', ali_success_order).toFixed(2,'0')
            let wx_success_order = await getDayMoney('wxpay',uid,{$gte:now})
            let wx = sum('pay_price',wx_success_order).toFixed(2,'0')
            let all = (parseFloat(ali) + parseFloat(wx)).toFixed(2, '0')
            res.json({
                code:1,
                data:{
                    wx,
                    ali,
                    all
                }
            })   
    } else if (backtime == -1) {
        if (uid==='10001') {
            let ali_success_order = await getDayMoney('alipay','',{$gte:now,$lt:yes})
            let ali = sum('pay_price', ali_success_order).toFixed(2,'0')
            let ali_fee = sum('fee',ali_success_order).toFixed(3,'0')
            let wx_success_order = await getDayMoney('wxpay','',{$gte:now,$lt:yes})
            let wx = sum('pay_price',wx_success_order).toFixed(2,'0')
            let wx_fee = sum('fee',wx_success_order).toFixed(3,'0')
            let all = (parseFloat(ali) + parseFloat(wx)).toFixed(2, '0')
            let all_fee = (parseFloat(ali_fee) + parseFloat(wx_fee)).toFixed(3, '0')
            return res.json({
                code:1,
                data:{
                    wx,
                    ali,
                    all,
                    wx_fee,
                    all_fee,
                    ali_fee
                }
            })
    }       
            let ali_success_order = await getDayMoney('alipay',uid,{$gte:now,$lt:yes})
            let ali = sum('pay_price', ali_success_order).toFixed(2,'0')
            let wx_success_order = await getDayMoney('wxpay',uid,{$gte:now,$lt:yes})
            let wx = sum('pay_price',wx_success_order).toFixed(2,'0')
            let wx_fee = sum('fee',wx_success_order).toFixed(3,'0')
            let all = (parseFloat(ali) + parseFloat(wx)).toFixed(2, '0')
            res.json({
                code:1,
                data:{
                    wx,
                    ali,
                    all
                }
            })
    }
})

router.get('/order/getOrderNumber', async (req, res)=>{
    let { uid } = req.query
    let date = new Date()
        let now = `${date.getFullYear()}-${(date.getMonth()+1)}-${date.getDate()} 0:0:0`
        date.setDate(date.getDate()-1)
        let yes = `${date.getFullYear()}-${(date.getMonth()+1)}-${date.getDate()} 0:0:0`
        const getOrderNumber = (status, uid, time) => {
        return new Promise((resolve, reject)=>{
            let select = {}
            if (uid) {
                select.uid = uid
            }
            if (status) {
                select.status = status
            }
            select.createTime = time
            Order.find(select)
             .then( order=>{
                 resolve(order)
             })
             .catch( err => reject(err))
        })
        }
    if (uid === '10001') {
        let today_success_order = await getOrderNumber(2,'',{$gte:now})
        let today_no_order = await getOrderNumber(1,'',{$gte:now})
        let today_all_order = await getOrderNumber('','',{$gte:now})
        let yes_success_order = await getOrderNumber(2,'',{$gte:yes,$lt:now})
        let yes_no_order = await getOrderNumber(1,'',{$gte:yes,$lt:now})
        let yes_all_order = await getOrderNumber('','',{$gte:yes,$lt:now})
        return res.json({
            code:1,
            data:{
                today_success_order,
                today_no_order,
                today_all_order,
                yes_success_order,
                yes_no_order,
                yes_all_order
            }
        })
    }
        let today_success_order = await getOrderNumber(2,uid,{$gte:now})
        let today_no_order = await getOrderNumber(1,uid,{$gte:now})
        let today_all_order = await getOrderNumber('',uid,{$gte:now})
        let yes_success_order = await getOrderNumber(2,uid,{$gte:yes,$lt:now})
        let yes_no_order = await getOrderNumber(1,uid,{$gte:yes,$lt:now})
        let yes_all_order = await getOrderNumber('',uid,{$gte:yes,$lt:now})
        res.json({
            code:1,
            data:{
                today_success_order,
                today_no_order,
                today_all_order,
                yes_success_order,
                yes_no_order,
                yes_all_order
            }
        })
})
module.exports = router