let express = require('express')
let app = express()
let router = express.Router()
let config = require('../sdk/config')
let Logpay = require('../sdk/lib/logpay.class')
const User = require('../../models/Users')
const Order = require('../../models/Orders')
//配置art-template
// art-template
// app.engine('html', require('express-art-template'))
// app.set('postData', './postData')
let logpay = new Logpay(config.uid,config.token)
router.get('/sdk/pay', (req, res)=>{
    let { payType, price, orderUid, orderName } = req.query
    process.env.TZ = 'Asia/Shanghai'
    let date = new Date()
    let YearMD = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}`
    let HoursMS = `${date.getHours().toString().padStart(2,'0')}${date.getMinutes().toString().padStart(2,'0')}${date.getSeconds().toString().padStart(2,'0')}`
    let Random = `${Math.floor(Math.random()*(999999-100000+1)+100000)}`
    let orderNumber = YearMD + HoursMS + Random
    let data = { payType, price, orderUid, orderName, orderNumber, returnUrl:config.returnUrl, notifyUrl:config.notifyUrl }
    let sign = logpay.Sign(data)
    res.render('post.html',{
        payType, price, orderUid, orderName, orderNumber, returnUrl:config.returnUrl, notifyUrl:config.notifyUrl,sign,uid:config.uid
    })
})
router.post('/sdk/notify',(req, res)=>{
	console.log(req.body)
    let { orderUid, payPrice, price, orderNumber, payType,callbackSign } = req.body
    let data = { orderUid, payPrice, price, payType, orderNumber, signs:req.body.sign }
    let sign = logpay.Signfornotify(data)
    Order.findOne({orderNumber})
	     .then(order => {
			 if (order.status === 2) {
				 return res.send('SUCCESS')
			 }
		 })
    console.log(sign, callbackSign)
	if (sign === callbackSign) {
        if (orderUid === '10001') {
            User.findOne({uid:'10001'})
                .then( admin => {
                    if (admin) {
                        let money = parseFloat(admin.money) + parseFloat(price)
                        let Money = money.toFixed(2, '0')
                        User.updateOne({uid:'10001'},{ money:Money })
                            .then( data =>{
                            return res.send('SUCCESS')
                            })
                            .catch( err => res.send('请联系客服,充值发生错误!'))
                    }
                })
                .catch(err => res.send('请联系客服,充值发生错误!'))
        } else {
                User.findOne( {uid:orderUid})
                    .then( user =>{
                        if (user) {
                            let money = parseFloat(user.money) + parseFloat(price)
                            let Money = money.toFixed(2, '0')
                            User.updateOne({ uid:orderUid },{ money:Money })
                                .then( data => {
                                        User.findOne({uid:'10001'})
                                            .then( admin => {
                                                if (admin) {
                                                    let money = parseFloat(admin.money) + parseFloat(price)
                                                    let Money = money.toFixed(2, '0')
                                                    User.updateOne({uid:'10001'},{ money:Money })
                                                        .then( data =>{
                                                        res.send('SUCCESS')
                                                        })
                                                        .catch( err => res.send('请联系客服,充值发生错误!'))
                                                    }
                                            })
                                            .catch(err => res.send('请联系客服,充值发生错误!'))
                                    })

                                .catch( err => res.send('请联系客服,充值发生错误!'))
                                }
                            })   
                        }
            // }
    } else {
        res.send('签名验证失败')
    }
})
router.get('/sdk/return',(req,res)=>{
    res.redirect('https://www.logpay.cn/account/#/index')
})
module.exports = router