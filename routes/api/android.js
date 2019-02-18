let express = require('express')
let router = express.Router()
let Tools = require('../../config/utils')
let Order = require('../../models/Orders')
const User = require('../../models/Users')
const bcrypt = require('bcrypt')
// 引用工具
let tools = new Tools()
//注意每个路由的时间戳不一样
router.get('/server/api/updateOrder',(req, res)=>{
    let { price, sign, type, e } = req.query
    User.findOne( {email:e} )
        .then( data => {
            if (!data) {
                res.json({
                    code:-1,
                    msg: '请您认真检查账户，密码!联系客服'
                })
            }
            if (type === 'wechat') {
                type = 'wxpay'
            }
            Order.find({ uid:data.uid, pay_price: price, payType: type, status: -1 ,expire: { $gt: 0, $lt: 300 }})
                 .then(data=> {
                        Order.updateOne({ orderNumber:data[0].orderNumber }, { status : 1 })
                             .then()
                             .catch(err => res.json('充值错误1'))
                        })
                 .catch( err => res.json('充值错误2'))
        })
})
// 安卓客户端回调
router.get('/server/api/setting',(req, res)=>{
    let { apiurl, secretkey, sign } = req.query
    if (tools.md5(tools.md5(apiurl) + secretkey) == sign) {
        User.findOne( {email:apiurl} )
        .then( data => {
            if (!data) {
                return res.json({
                    code:-1,
                    msg:'您的邮箱未注册!'
                })
            }
            bcrypt.compare(secretkey, data.password)
            // 比较密码 返回isMatch 错误正确
                    .then(isMatch=>{
                            if (isMatch) {
                                  let callbackforphone = {
                                        code : 1,
                                        msg: '登陆成功',
                                        data: '',
                                        url: '',
                                        wait: 3
                                    }
                                    res.send(callbackforphone)  
                            } else {
                                res.json({
                                    code:'-1',
                                    msg:'密码错误!'
                                })
                            } 
                        })
                    })
                }
})

module.exports = router