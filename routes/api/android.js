const express = require('express')
const router = express.Router()
const Tools = require('../../config/utils')
const Order = require('../../models/Orders')
const User = require('../../models/Users')
const bcrypt = require('bcrypt')
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
                                                Order.updateOne({ orderNumber:order[0].orderNumber }, { status : 1 })
                                                     .then()
                                                     .catch(err => res.json('recharge-error-1'))
                                                })
                                         .catch( err => res.json('recharge-error-2'))
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