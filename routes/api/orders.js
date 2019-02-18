const express = require('express')
const router = express.Router()
const Order = require('../../models/Orders') 
const jwt = require('jsonwebtoken')
const passport = require('passport')
// 注册新用户

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
              .then( result =>{
                let skip = (parseInt(params.page-1))*parseInt(params.num)
                let limit = parseInt(params.num)
                Order.find(query)
                      .sort({'_id':-1})
                      .skip(skip)
                      .limit(limit) 
                      .exec()
                      .then( data => {
                        if (!data) throw ('无数据!')
                        res.json({
                          code: 1,
                          data: {
                              data,
                              result
                          },
                          msg: '获取成功!'
                      })
                    })
                      .catch( err => console.log(err))
              })
              .catch( err => console.log(err))
    } catch (e) {
        res.json({
            code: -1,
            data: '',
            msg: e
        })
    }
})

module.exports = router