const express = require('express')
const router = express.Router()
const User = require('../../models/Users')
const bcrypt = require('bcrypt')
const secret = require('../../config/config').secret
const jwt = require('jsonwebtoken')
const passport = require('passport')
const Tools = require('../../config/utils')
const JWT = require('jwt-simple')
const nodemailer = require('nodemailer')
const request = require('request')
const Meal = require('../../models/Meals')
// 注册新用户
let tools = new Tools()
router.get('/',(req, res)=>{
	res.render('index.html')
})
router.post('/user/register', async (req, res)=>{
    let { email, password } = req.body
     User.findOne({ email })
         .then(user1=>{
             if (user1) {
                 return res.json({ msg:"邮箱已经被注册",code:20001 })
             } else {
                 let uid = ''
                 User.find()
                     .then( user2 => {
                         if (user2) {
                            uid = 10001 + user2.length
                         } else {
                            uid = '10001'
                         }
                        let token = tools.getToken(uid)
						let ip = tools.getClientIP(req)
                        let resolveUrl = 'http://ip.taobao.com/service/getIpInfo.php?ip='+ ip
                                request.get({
                                    url: resolveUrl,
                                    encoding: null // 指定编码
                                }, (error, response, body) => {
                                    if (error) {
                                        console.log(err)
                                    } else {
                                        let data = JSON.parse(body)
                                        let address = data.data.country+data.data.region+data.data.city
                                        let money = '0.00'
                                        let date = tools.localDate()
                                        let user = new User({
                                            email,
                                            password,
                                            uid,
                                            token,
                                            meal:'mf',
                                            mealtime: '-',
                                            money,
                                            userid:'',
                                            date,
                                            ip,
                                            address
                                        })
                                         // 密码加密
                                        bcrypt.genSalt(10, (err, salt) => {
                                            bcrypt.hash( user.password, salt, (err, hash) => {
                                                if (err) throw err
                                                user.password = hash
                                                user.save()
                                                    .then(user3 => res.json({
                                                        code: 20000,
                                                        msg:'注册成功'
                                                    }))
                                                    .catch(err => res.json('注册失败请重新注册'))
                                            })
                                        })
                                    }
                                })
                            })
                }
             })
})

//登陆  返回token
router.post('/user/login',(req,res)=>{
    let { email, password } = req.body
    //查询数据库
    User.findOne( {email} )
    .then( user => {
        if (!user) {
            return res.json({
                code:20001,
                msg:'您的邮箱未注册'
            })
        }
        bcrypt.compare(password, user.password)
        // 比较密码 返回isMatch 错误正确   
        .then(isMatch=>{
                if (isMatch) {
                    // jwt.sign( "规则", "加密名字", "过期时间", "箭头函数")
                    let rule = { id:user.id, email:user.email }
                    jwt.sign( rule, secret,{expiresIn:3600},(err, token)=>{
                        if (err) throw err
                        res.json({
                            code:20000,
                            msg:'登陆成功',
                            data:{
                                token :'Bearer '+ token,
                            }
                        })
                    })
                } else {
                    return res.json({
                        code:20002,
                        msg:'密码错误'
                    })
                }
            }) 
        })
    })

router.get('/user/getInfo',passport.authenticate("jwt",{session:false}),(req, res)=>{
    let { id, email,uid,token,meal,mealtime,money,roles} = req.user
    res.json({
        code:20000,
        data:{
            id,
            email,
            uid,
            token,
            meal,
            mealtime,
            money,
			roles
        }
    })
})

router.post('/user/logout',(req, res)=>{
    res.json({
        code:20000  
    })
})

router.post('/user/cpassword',(req, res)=>{
    let { email, oldpassword, password } = req.body
    User.findOne( {email} )
        .then( user => {
        bcrypt.compare(oldpassword, user.password)
            // 比较密码 返回isMatch 错误正确  
            .then(isMatch=>{
                    if (isMatch) {
                        // 密码加密
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash( password, salt, (err, hash) => {
                                if (err) throw err
                                password = hash
                                User.updateOne({ email },{ password })
                                    .then()
                                    .catch(err => res.json('修改密码失败,请重试'))
                            })
                        })
                        // jwt.sign( "规则", "加密名字", "过期时间", "箭头函数")
                        let rule = { id:user.id, email:user.email }
                        jwt.sign( rule, secret,{expiresIn:36000},(err, token)=>{
                            if (err) throw err
                            res.json({
                                code:20000,
                                data:{
                                    token :'Bearer '+ token,
                                    msg:'登陆成功'
                                }
                            })
                        })
                    } else {
                        return res.json({ code:20001, msg:'密码错误' })
                    }
                })
            })
        
})

router.post('/user/userid',(req, res)=>{
    let { uid, userid } = req.body
    User.updateOne({uid},{userid})
         .then( data => res.json('success'))     
         .catch( err => res.json('error'))
})

router.post('/user/cmeal',(req, res)=>{
    let { uid, meal, mealtime, cmoney, renew } = req.body
    let date = new Date()
    function getTime(time, month) {
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
    User.findOne({uid})
        .then( user =>{
            if (user) {
                if (user.meal == meal) {
                    if (meal == 'mf') {
                        res.redirect('/#/user/cmeal')
                    }
                    if (mealtime == 'ygy') {
                        user.mealtime = getTime(user.mealtime ,1)
                     } else if (mealtime == 'sgy') {
                        user.mealtime = getTime(user.mealtime, 3)
                     } else if (mealtime == 'bn') {
                        user.mealtime = getTime(user.mealtime, 6)
                     } else if (mealtime == 'yn') {
                        user.mealtime = getTime(user.mealtime, 12)
                     }
                } else if (user.meal == 'mf') {
                    if (meal == 'gj' || meal == 'bz') {
                    let date = new Date()
                    let now = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`
                    if (mealtime == 'ygy') {
                        user.mealtime = getTime(now,1)
                     } else if (mealtime == 'sgy') {
                        user.mealtime = getTime(now, 3)
                     } else if (mealtime == 'bn') {
                        user.mealtime = getTime(now, 6)
                     } else if (mealtime == 'yn') {
                        user.mealtime = getTime(now, 12)
                     }
                    }
                } else if (user.meal == 'bz' && meal == 'gj') {
                    let date = new Date()
                    let now = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`
                    if (mealtime == 'ygy') {
                        user.mealtime = getTime(now,1)
                     } else if (mealtime == 'sgy') {
                        user.mealtime = getTime(now, 3)
                     } else if (mealtime == 'bn') {
                        user.mealtime = getTime(now, 6)
                     } else if (mealtime == 'yn') {
                        user.mealtime = getTime(now, 12)
                     }
                }
                user.meal = meal
                user.money = parseFloat(user.money - cmoney).toFixed(2,'0')
                if ((user.money) < 0) {
                    return false
                }
                User.update({uid},{meal:user.meal, mealtime:user.mealtime, money:user.money, renew})
                    .then()
                    .catch(err => res.json('请联系客服'))
            }
        })
})

router.post('/user/passwordreset', (req, res)=>{
    if (req.body.email !== undefined) {
        let emailAddress = req.body.email
        let tokenExpiresTime = 1000 * 60 * 10
        User.findOne({email:emailAddress})
            .then( user =>{
                if (!user) {
                    return res.json({
                        code:20001,
                        msg:'邮箱未注册'
                    })
                    }
                    let payload = {
                        id:user.id,
                        email:emailAddress,
                        expires: Date.now() + tokenExpiresTime
                    }
                    let resetsecret = user.password + secret + user.date.getTime()
                    let token = JWT.encode(payload, resetsecret)
                    // 发送邮件
                    let transporter = nodemailer.createTransport({
                    // host: 'smtp.ethereal.email',
                    service: 'qq', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
                    port: 465, // SMTP 端口
                    secureConnection: true, // 使用了 SSL
                    auth: {
                        user: '963359789@qq.com',//你的邮箱
                        // 这里密码不是qq密码，是你设置的smtp授权码
                        pass: 'tllmuanfzhzabdjd',
                    }
                    })
                    let HTML = 'http://114.115.150.18/user/resetpassword/' + user.id+ '/'+token
                    let mailOptions = {
                    from: '"LogPay密码重置" <963359789@qq.com>', // sender address
                    to: emailAddress, // list of receivers
                    subject: 'LogPay密码重置', // Subject line
                    // 发送text或者html格式
                    // text: '', // plain text body
                    html: HTML
                    }
                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return res.json({
                            code:-1,
                            msg:'系统繁忙,请重试!'
                        })
                    }
                    res.json({
                        code:1,
                        msg:'邮箱发送成功,请注意查收!'
                    })
                    })
            })
            .catch(err => res.json({
                code: 20003,
                msg: '系统繁忙'
            }))
    } else {
        res.json({
            code:20002,
            msg:'请认真填写邮箱'
        })
    }
})

router.get('/user/resetpassword/:id/:token', (req, res)=>{
    User.findOne({_id:req.params.id})
            .then( user =>{
                if (!user) {
                    return res.json({
                        code:20001,
                        msg:'邮箱未注册'
                    })
                    }
                    let resetsecret = user.password + secret + user.date.getTime()
                    let payload = JWT.decode(req.params.token, resetsecret)
					 if (payload.expires < Date.now()) {
                        return res.send('该网址已过期')   
                    }
                    let token = req.params.token
                    res.render('fpassword.html', {
                        payload,
                        token
                    })

            })
            .catch(err => res.json({
                code:20003,
                msg:'系统繁忙'
            }))
})

router.post('/user/resetpassword', (req, res)=>{
	if( req.body.password !== req.body.checkPassword ) {
		return res.send('两次密码输入不一致')
	}
    User.findOne({_id:req.body.id})
            .then( user =>{
                if (!user) {
                    return res.json({
                        code:20001,
                        msg:'邮箱未注册'
                    })
                    }
                    let resetsecret = user.password + secret + user.date.getTime()
                    let payload = JWT.decode(req.body.token, resetsecret)
                    // 密码加密
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash( req.body.password, salt, (err, hash) => {
                            if (err) throw err
                            User.updateOne({_id:req.body.id},{password:hash})
                                .then()
                                .catch(err => res.json({
                                    code:20003,
                                    msg:'系统繁忙'
                                }))
                        })
                    })
                    res.send('密码重置成功')

            })
            .catch(err => res.json({
                code:20003,
                msg:'系统繁忙'
            }))
})

router.post('/user/addMeal',(req, res)=>{
try {
	 let params = req.body
	 let meal = new Meal(params)
	  meal.save()
		  .then(data=> {
			  res.json({
				code: 1,
				data:'',
				msg: '添加成功'
			  })
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

router.delete('/user/delMeal', async (req, res) => {
    try{
        let params = req.body
        Meal.deleteOne({_id:params.id})
              .then( data => {
              res.json({
                  code: 0,
                  data: '',
                  msg: '删除成功'
              })})
              .catch( err => {
                res.json({
                    code: -1,
                    data: '',
                    msg: err
                })})
    } catch (e) {
        res.json({
            code: -1,
            data: '',
            msg: e
        })
    }
})

router.post('/user/changeMerchantMeal',(req, res)=>{
try {
	 let params = req.body
	 User.updateMany({_id:params._id},params)
		  .then(data =>{
			  res.json({
				code: 1,
				data:'',
				msg: '编辑成功'
			})
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

router.post('/user/changeMeal',(req, res)=>{
try {
	 let params = req.body
	 Meal.updateMany({_id:params._id},params)
		  .then(data =>{
			  res.json({
				code: 1,
				data:'',
				msg: '编辑成功'
			})
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

router.get('/user/getMeal',(req, res)=>{
try {
	 let params = req.query
	 let skip,limit
	 if(params.page && params.num) {
		 skip = (parseInt(params.page-1))*parseInt(params.num)
		 limit = parseInt(params.num) 
	 } else {
		  skip = null
		  limit = null
	 }
	 console.log(params)
		 if (params.role === 'admin') {
			 Meal.find({})
	//		  .sort({'_id':-1})
			  .then( meal =>{
				 Meal.find({})
	//				  .sort({'_id':-1})
					  .skip(skip)
					  .limit(limit) 
					  .exec()
					  .then( select => {
						if (!select) throw ('无数据')
						res.json({
						  code: 1,
						  data: {
							  select,
							  meal
						  },
						  msg: '获取成功'
					  })
					})
					  .catch( err => res.json('当前系统繁忙'))
			  })
			  .catch( err => res.json('当前系统繁忙'))		 
		 }
		} catch (e) {
			res.json({
				code:-1,
				data:'',
				msg:e
			})
		}
})

router.get('/user/getMerchant',(req, res)=>{
try {
	 let params = req.query
	 let type = params.type
	 let value = params.value
	 let query = {}
	 if ( type ==='uid' && value) {
		 query.uid = value
	 }
	 if ( type ==='email' && value) {
		 query.email = value
	 }
	 User.find(query)
		  .sort({'_id':-1})
		  .then( user =>{
			 let skip = (parseInt(params.page-1))*parseInt(params.num)
			 let limit = parseInt(params.num)
			 User.find(query)
				  .sort({'_id':-1})
				  .skip(skip)
				  .limit(limit) 
				  .exec()
				  .then( select => {
					if (!select) throw ('无数据')
					res.json({
					  code: 1,
					  data: {
						  select,
						  user
					  },
					  msg: '获取成功'
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
// 配置文件下载
router.get("/download/APK", (req, res)=>{
    res.download("public/download/LogPay.apk")
})

router.get("/download/SDK", (req, res)=>{
    res.download("public/download/logpay-phpsdk.zip")
})
module.exports = router