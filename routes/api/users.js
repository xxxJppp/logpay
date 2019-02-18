const express = require('express')
const router = express.Router()
const User = require('../../models/Users')
const bcrypt = require('bcrypt')
const secret = require('../../config/config').secret
const jwt = require('jsonwebtoken')
const passport = require('passport')
const Tools = require('../../config/utils')
// 注册新用户
let tools = new Tools()
router.post('/user/register',(req, res)=>{
    let { email, password } = req.body
    User.findOne({ email })
         .then(data=>{
             if (data) {
                 return res.json({ msg:"邮箱已经被注册!",code:20001 })
             } else {
                 let uid = ''
                 User.find()
                     .then( data => {
                         if (data) {
                            uid = 10001 + data.length
                         } else {
                            uid = '10001'
                         }
                        
                        let date = new Date()
                                let token = tools.getToken(uid)
                                let money = '0.00'
                                let user = new User({
                                    email,
                                    password,
                                    uid,
                                    token,
                                    meal:'mf',
                                    mealtime: '-',
                                    money,
                                    userid:'',
                                })
                                // 密码加密
                            bcrypt.genSalt(10, (err, salt) => {
                                bcrypt.hash( user.password, salt, (err, hash) => {
                                    if (err) throw err
                                    user.password = hash
                                    user.save()
                                        .then(data => res.json({
                                            code: 20000,
                                            msg:'注册成功!'
                                        }))
                                        .catch(err => console.log(err))
                                })
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
    .then( data => {
        if (!data) {
            return res.json({
                code:20001,
                msg:'您的邮箱未注册!'
            })
        }
        bcrypt.compare(password, data.password)
        // 比较密码 返回isMatch 错误正确   
        .then(isMatch=>{
                if (isMatch) {
                    // jwt.sign( "规则", "加密名字", "过期时间", "箭头函数")
                    let rule = { id:data.id, email:data.email }
                    jwt.sign( rule, secret,{expiresIn:3600},(err, token)=>{
                        if (err) throw err
                        res.json({
                            code:20000,
                            msg:'登陆成功!',
                            data:{
                                token :'Bearer '+ token,
                            }
                        })
                    })
                } else {
                    return res.json({
                        code:20002,
                        msg:'密码错误!'
                    })
                }
            }) 
        })
    })

router.get('/user/getInfo',passport.authenticate("jwt",{session:false}),(req, res)=>{
    let { id, email,uid,token,meal,mealtime,money } = req.user
    res.json({
        code:20000,
        data:{
            id,
            email,
            uid,
            token,
            meal,
            mealtime,
            money
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
        .then( data => {
        bcrypt.compare(oldpassword, data.password)
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
                                    .catch(err => console.log(err))
                            })
                        })
                        // jwt.sign( "规则", "加密名字", "过期时间", "箭头函数")
                        let rule = { id:data.id, email:data.email }
                        jwt.sign( rule, secret,{expiresIn:3600},(err, token)=>{
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
                        return res.json({ code:20001, msg:'密码错误!' })
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
    let { uid, meal, mealtime, cmoney } = req.body
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
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`
      }
    User.findOne({uid})
        .then( data =>{
            if (data) {
                if (data.meal == meal) {
                    if (meal == 'mf') {
                        res.redirect('http://192.168.0.107:9259/#/user/cmeal')
                    }
                    if (mealtime == 'ygy') {
                        data.mealtime = getTime(data.mealtime ,1)
                     } else if (mealtime == 'sgy') {
                        data.mealtime = getTime(data.mealtime, 3)
                     } else if (mealtime == 'bn') {
                        data.mealtime = getTime(data.mealtime, 6)
                     } else if (mealtime == 'yn') {
                        data.mealtime = getTime(data.mealtime, 12)
                     }
                } else if (data.meal == 'mf') {
                    if (meal == 'gj' || meal == 'bz') {
                    let date = new Date()
                    let now = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`
                    if (mealtime == 'ygy') {
                        data.mealtime = getTime(now,1)
                     } else if (mealtime == 'sgy') {
                        data.mealtime = getTime(now, 3)
                     } else if (mealtime == 'bn') {
                        data.mealtime = getTime(now, 6)
                     } else if (mealtime == 'yn') {
                        data.mealtime = getTime(now, 12)
                     }
                    }
                } else if (data.meal == 'bz' && meal == 'gj') {
                    let date = new Date()
                    let now = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`
                    if (mealtime == 'ygy') {
                        data.mealtime = getTime(now,1)
                     } else if (mealtime == 'sgy') {
                        data.mealtime = getTime(now, 3)
                     } else if (mealtime == 'bn') {
                        data.mealtime = getTime(now, 6)
                     } else if (mealtime == 'yn') {
                        data.mealtime = getTime(now, 12)
                     }
                }
                data.meal = meal
                data.money = parseFloat(data.money - cmoney).toFixed(2,'0')
                if ((data.money) < 0) {
                    return false
                }
                User.update({uid},{meal:data.meal, mealtime:data.mealtime, money:data.money})
                    .then()
                    .catch(err => res.json('请联系客服!'))
            }
        })
})
module.exports = router