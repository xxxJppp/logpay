const express = require('express')
const router = express.Router()
const User = require('../../models/Users')
const bcrypt = require('bcrypt')
const secret = require('../../config').secret
// jsonwebtoken 来获取token
const jwt = require('jsonwebtoken')
// 验证toekn
const passport = require('passport')
const Tools = require('../../utils/utils')
const JWT = require('jwt-simple')
const nodemailer = require('nodemailer')
const request = require('request')
const Meal = require('../../models/Meals')
// 引入手机数据库
const PhoneId = require('../../models/PhoneIds')
// 注册新用户
let tools = new Tools()
router.get('/.well-known/pki-validation/fileauth.txt',(req, res)=>{
  res.send('2019031500000068mlkjuogxnlriknmmdupngx05b05h5rvpni9de3uvr310orpw')
})
router.post('/user/register', async (req, res)=>{
    let { email, password } = req.body
     User.findOne({ email })
         .then(user1=>{
             if (user1) {
                 return res.json({ msg:"邮箱已经被注册",code:-1 })
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
                        // let resolveUrl = 'http://ip.taobao.com/service/getIpInfo.php?ip='+ ip
                                // request.get({
                                    // url: resolveUrl,
                                    // encoding: null // 指定编码
                                // }, (error, response, body) => {
                                        // let address = '未知地区'
                                    // if (body) {
                                        // let data = JSON.parse(body)
                                        // address = data.data.country+data.data.region+data.data.city
                                    // }
                                        let date = tools.localDate()
                                        let user = new User({
                                            email,
                                            password,
                                            uid,
                                            token,
                                            date,
                                            ip,
                                            address:ip
                                        })
                                         // 密码加密
                                        bcrypt.genSalt(10, (err, salt) => {
                                            bcrypt.hash( user.password, salt, (err, hash) => {
                                                if (err) throw err
                                                user.password = hash
                                                user.save()
                                                    .then(user3 => res.json({
                                                        code: 1,
                                                        msg:'注册成功'
                                                    }))
                                                    .catch(err => res.json('注册失败请重新注册'))
                                            })
                                        })

                                })
                            // })
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
                code:-1,
                msg:'您的邮箱未注册'
            })
        }
        bcrypt.compare(password, user.password)
        // 比较密码 返回isMatch 错误正确   
        .then(isMatch=>{
                if (isMatch) {
                    // jwt.sign( "规则", "加密名字", "过期时间", "箭头函数")
                    let rule = { id:user.id, email:user.email }
                    jwt.sign( rule, secret,{expiresIn:36000},(err, token)=>{
                        if (err) throw err
                        res.json({
                            code:1,
                            msg:'登陆成功',
                            data:{
                                token :'Bearer '+ token,
                            }
                        })
                    })
                } else {
                    return res.json({
                        code:-1,
                        msg:'密码错误'
                    })
                }
            }) 
        })
    })

router.get('/user/getInfo', passport.authenticate("jwt",{session:false}),(req, res)=>{
    let { id, email,uid,token,meal,mealtime,money,roles} = req.user
    res.json({
        code:1,
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

router.post('/user/logout', passport.authenticate("jwt",{session:false}), (req, res)=>{
    res.json({
        code:1  
    })
})

router.post('/user/cpassword', passport.authenticate("jwt",{session:false}), (req, res)=>{
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
                                code:1,
                                data:{
                                    token :'Bearer '+ token,
                                    msg:'登陆成功'
                                }
                            })
                        })
                    } else {
                        return res.json({ code:-1, msg:'密码错误' })
                    }
                })
            })
        
})

router.post('/user/userid', passport.authenticate("jwt",{session:false}), (req, res)=>{
    let { uid, phoneId, userid } = req.body
    PhoneId.updateOne({uid, id:phoneId},{userid})
         .then( phone => res.json({
             code: 1,
             msg: '配置成功'
         }))
         .catch( err => res.json({
             code:-1,
             msg:'系统繁忙请稍等' + err
         }))
})

router.post('/user/cmeal', passport.authenticate("jwt",{session:false}), (req, res)=>{
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
                        return res.redirect('https://www.logpay.cn/account/#/user/cmeal')
                    } else {
                    if (mealtime == 'ygy') {
                        user.mealtime = getTime(user.mealtime ,1)
                     } else if (mealtime == 'sgy') {
                        user.mealtime = getTime(user.mealtime, 3)
                     } else if (mealtime == 'bn') {
                        user.mealtime = getTime(user.mealtime, 6)
                     } else if (mealtime == 'yn') {
                        user.mealtime = getTime(user.mealtime, 12)
					}}
                } else if (user.meal == 'mf') {
                    if (meal == 'gj' || meal == 'bz') {
                    let date = new Date()
                    let now = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`
                    if (mealtime === 'bb') {
						return res.json({
						code:1,
						msg:'续费成功'
					})
					} else if (mealtime == 'ygy') {
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
                    if (mealtime === 'bb') {
						return res.json({
						code:1,
						msg:'续费成功'
					 })
					 } else if (mealtime == 'ygy') {
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
                    .then(user => res.json({
						code:1,
						msg:'续费成功'
					}))
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
                        code:-1,
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
                    let HTML = 'https://api.logpay.cn/user/resetpassword/' + user.id+ '/'+token
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
                code: -1,
                msg: '系统繁忙'
            }))
    } else {
        res.json({
            code:-1,
            msg:'请认真填写邮箱'
        })
    }
})

router.get('/user/resetpassword/:id/:token', (req, res)=>{
    User.findOne({_id:req.params.id})
            .then( user =>{
                if (!user) {
                    return res.json({
                        code:-1,
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
                code:-1,
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
                        code:-1,
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
                                    code:-1,
                                    msg:'系统繁忙'
                                }))
                        })
                    })
                    res.send('密码重置成功')

            })
            .catch(err => res.json({
                code:-1,
                msg:'系统繁忙'
            }))
})

router.post('/user/addMeal', passport.authenticate("jwt",{session:false}), (req, res)=>{
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

router.delete('/user/delMeal', passport.authenticate("jwt",{session:false}), async (req, res) => {
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

router.post('/user/changeMerchantMeal', passport.authenticate("jwt",{session:false}), (req, res)=>{
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
        data:'当前系统繁忙 请稍后重试',
        msg:e
      })
    }
})

router.post('/user/changeMeal', passport.authenticate("jwt",{session:false}), (req, res)=>{
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

router.get('/user/getMeal', passport.authenticate("jwt",{session:false}), (req, res)=>{
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
     if (params.role === 'admin') {
       Meal.find({})
  //      .sort({'_id':-1})
        .then( meal =>{
         Meal.find({})
  //          .sort({'_id':-1})
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

router.get('/user/getMerchant', passport.authenticate("jwt",{session:false}), (req, res)=>{
try {
   let params = req.query
   let type = params.type
   let value = params.value
   let page = params.page
   let num = params.num
   let role = params.role
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
        if ( page && num && role ==='admin') {
            let skip = (parseInt(page-1))*parseInt(num)
            let limit = parseInt(num)
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
            .catch( err => res.json({
                code:-1,
                errData:err,
                msg:'当前系统繁忙 请稍会再试'
              }))
        } else {
            res.json({
                code: 1,
                user:{
                    email:user[0].email
                },
                msg: '获取成功'
            })
        }
      })
      .catch( err => res.json({
        code:-1,
        errData:err,
        msg:'当前系统繁忙 请稍会再试'
      }))
    } catch (e) {
      res.json({
        code:-1,
        errData:e,
        msg:'当前系统繁忙 请稍会再试'
      })
    }
})

// 增加手机
router.post('/user/addPhone', passport.authenticate("jwt",{session:false}), (req, res)=>{
    let { uid } = req.body
    PhoneId.find({uid})
           .then(phone=>{
               let phoneId = new PhoneId({
                   uid,
                   id: phone.length + 1
               })
               phoneId.save()
                      .then(phone1=>{
                          res.send({
                              code: 1,
                              msg: phone.length + 1
                          })
                      })
                      .catch(err => {
                          res.send({
                              code: -1,
                              msg: '系统繁忙请稍等' + err,
                              errData: err
                          })
                      })
           })
})
router.get('/user/getPhone', passport.authenticate("jwt",{session:false}), (req, res)=>{
    let { uid } = req.query
    PhoneId.find({uid})
           .then( phone =>{
                   res.send({
                       code: 1,
                       data: phone,
                       msg: '获取成功'
                   })
           })
           .catch( err =>{
               res.send({
                   code: -1,
                   errData: err,
                   msg: '系统繁忙请稍等' + err
               })
           })
})
// 获取手机是否开启服务
router.get('/user/getPhoneOpen', passport.authenticate("jwt",{session:false}), (req, res)=>{
    let { uid, phoneId } = req.query
    PhoneId.findOne({ uid, id:phoneId })
           .then(phone=>{
               if (phone) {
                res.send({
                    code: 1,
                    data: phone.open,
                    msg: '获取成功'
                })   
               } else {
                   res.send({
                       code: 0,
                       msg: '无该手机'
                   })
               }
           })
           .catch(err=>{
                res.send({ 
                    code: -1,
                    errData: err,
                    msg: '系统繁忙请稍等' + err
                })
           })
})
// 修改手机收款开启情况
router.post('/user/cPhoneOpen', passport.authenticate("jwt",{session:false}), async (req, res)=>{
     let { uid, phoneId, openPhone } = req.body
     const checkOpenPhone = (uid, phoneId) =>{
         return new Promise((resolve, reject)=>{
            PhoneId.findOne({uid, id:phoneId})
            .then(phone=>{
                if (phone) {
                    if (phone.open === openPhone) {
                        return resolve(false)
                    } else {
                        return resolve(true)
                    }
                } else {
                    return resolve(false)
                }
            })
            .catch(err=>reject(err))
         })
     }
     let checked = await checkOpenPhone(uid, phoneId)
     if (checked === true) {
        PhoneId.updateOne({uid, id:phoneId}, {open:openPhone})
        .then(phone1=>{
            if (openPhone) {
                res.send({
                    code: 1,
                    msg: '开启手机 ' + phoneId + ' 收款成功'
                })
            } else {
                res.send({
                    code: 1,
                    msg: '关闭手机 ' + phoneId + ' 收款成功'
                })
            }
        })
        .catch(err=>{
            res.send({
                code: -1,
                errData: err,
                msg: '系统繁忙请稍等' + err
            })
    })
    } else {
        res.send({
            code: 0,
            msg:'Not Changed'
        })
    }
})
// 获取限额
router.get('/user/getLimitMoney', passport.authenticate("jwt",{session:false}), (req, res)=>{
    let { uid, phoneId } = req.query
    PhoneId.findOne({ uid, id:phoneId })
           .then(phone=>{
               if (phone) {
                res.send({
                    code: 1,
                    data: {
                        wxpayLimit:phone.wxpayLimit,
                        alipayLimit:phone.alipayLimit
                    },
                    msg: '获取成功'
                })   
               } else {
                   res.send({
                       code: 0,
                       msg: '无该手机'
                   })
               }
           })
           .catch(err=>{
                res.send({ 
                    code: -1,
                    errData: err,
                    msg: '系统繁忙请稍等' + err
                })
           })
})

//设置限额
router.post('/user/cLimitMoney', passport.authenticate("jwt",{session:false}), (req, res)=>{
    let {wxpayLimit, alipayLimit, uid, phoneId} = req.body
    PhoneId.updateMany({uid, id:phoneId}, {wxpayLimit, alipayLimit})
        .then(phone=>{
            res.send({
                code: 1,
                msg: '设置成功'
            })
        })
        .catch(err=>{
            res.send({
                code: -1,
                errData: err,
                msg: '系统繁忙请稍等' + err
            })
    })
})

//获取userid
router.get('/user/getUserid', passport.authenticate("jwt",{session:false}), (req, res)=>{
    let { uid, phoneId } = req.query
    console.log(uid, phoneId)
    PhoneId.findOne({ uid, id:phoneId })
           .then(phone=>{
               if (phone) {
                res.send({
                    code: 1,
                    data: phone.userid,
                    msg: '获取成功'
                })   
               } else {
                   res.send({
                       code: 0,
                       msg: '无该手机'
                   })
               }
           })
           .catch(err=>{
                res.send({
                    code: -1,
                    errData: err,
                    msg: '系统繁忙请稍等' + err
                })
           })
})

// 用户测试
router.get('/user/test', (req, res)=>{
	let { uid, token, payType, price, notifyUrl, returnUrl, orderUid, orderName } = req.query
	process.env.TZ = 'Asia/Shanghai'
    let date = new Date()
    let YearMD = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2,'0')}${date.getDate().toString().padStart(2,'0')}`
    let HoursMS = `${date.getHours().toString().padStart(2,'0')}${date.getMinutes().toString().padStart(2,'0')}${date.getSeconds().toString().padStart(2,'0')}`
    let Random = `${Math.floor(Math.random()*(999999-100000+1)+100000)}`
    let orderNumber = YearMD + HoursMS + Random
    let data = { payType, price, orderUid, orderName, orderNumber, returnUrl, notifyUrl }
	let Logpay = require('../sdk/lib/logpay.class')
	let logpay = new Logpay(uid, token)
    let sign = logpay.Sign(data)
	let ip = tools.getClientIP(req)
    res.render('post.html',{
        payType, price, orderUid, orderName, orderNumber, returnUrl, notifyUrl, sign, uid, ip
    })
})

// 获取帐户备注
router.get('/user/getPhoneRemark', passport.authenticate("jwt",{session:false}), (req, res)=>{
	let { uid, phoneId } = req.query
	PhoneId.findOne({ uid, id:phoneId })
	       .then( phone=>{
			   if (phone.alipayRemark != null && phone.wxpayRemark != null) {
					if (phone) {
					   res.json({
						   code: 1,
						   data: {
							   alipayRemark:phone.alipayRemark,
							   wxpayRemark:phone.wxpayRemark
						   },
						   msg: '获取成功'
					   })
				   } else {
					   res.send({
						   code: 0,
						   msg: '无该手机'
					   })
				   }
			   } else {
				res.json({
				   code: 1,
				   data:{
					   alipayRemark: '',
					   wxpayRemark: ''
				   },
				   msg: '获取成功'
			   })
			   }			   
		   })
		   .catch(err =>{
			   res.json({
				   code: -1,
				   errData: err,
				   msg: '系统繁忙请稍等' + err
			   })
		   })
})

// 帐户备注
router.post('/user/cPhoneRemark', passport.authenticate("jwt",{session:false}), (req, res)=>{
	let { uid, phoneId, alipayRemark, wxpayRemark } = req.body
	PhoneId.updateMany({ uid, id:phoneId }, { alipayRemark, wxpayRemark })
	       .then( phone=>{
			   res.json({
				   code: 1,
				   msg: '备注成功'
			   })
		   })
		   .catch(err =>{
			   res.json({
				   code: -1,
				   errData: err,
				   msg: '系统繁忙请稍等' + err
			   })
		   })
})
// 配置文件下载
router.get("/download/APK", (req, res)=>{
    res.download("public/download/LogPay.apk")
})

router.get("/download/SDK", (req, res)=>{
    res.download("public/download/logpay-phpsdk.zip")
})

router.get("/download/VX", (req, res)=>{
    res.download("public/download/vx.apk")
})
module.exports = router