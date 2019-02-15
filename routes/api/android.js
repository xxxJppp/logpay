let express = require('express')
let router = express.Router()
let Tools = require('../../config/utils')
let Order = require('../../models/Orders')
let serversecretkey = 123456 //配置安卓
// 引用工具
let tools = new Tools()
//注意每个路由的时间戳不一样
router.get('/server/api/updateOrder',(req, res)=>{
    let { price, sign, type, r } = req.query
    if(tools.md5(tools.md5(price + type) + serversecretkey) === sign) {
    Order.find({ uid:'10001', pay_price: price, status: -1 },(err,data)=>{
        if (err) {
            return res.status(500).send('Server error')            
        } else {
            for (let i = 0; i < data.length; i++) {
                if (data[i].expire !==  0) {
                        let orderNumber = data[i].orderNumber
                        Order.updateOne({ orderNumber }, { status : 1 })
                             .then( data=>{
                                console.log(data)
                                return true
                             })
                             .catch(err => res.json('error!'))
                }
            }
        }
    })
}
})

// 安卓客户端回调
router.get('/server/api/setting',(req, res)=>{
    let { apiurl, sign } = req.query
    if ( tools.md5(tools.md5(apiurl)+serversecretkey) === sign ) {
        let callbackforphone = {
            code : 1,
            msg: '配置成功',
            data: '',
            url: '',
            wait: 3
        }
        res.send(callbackforphone)
    } else {
        res.body = errSign('密钥不正确')
    }
})

module.exports = router