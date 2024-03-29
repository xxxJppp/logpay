﻿const express = require('express')
const app = express()
// 设置时区
process.env.TZ = 'Asia/Shanghai'
//引入用户登录路由
const users = require('./routes/api/users')
//引入数据读取路由
const orders = require('./routes/api/orders')
//引入二维码操作路由
const qrcodes = require('./routes/api/qrcodes')
//引入支付核心
const core = require('./routes/api/core')
//引入安卓核心
const android = require('./routes/api/android')
//引入sdk核心
const sdk = require('./routes/sdk/pay')
//引入f2f回调监控 
const alipayF2fNotify = require('./routes/api/alipayf2f')

const bodyParser = require('body-parser')
const passport = require('passport')
const port = process.env.PORT || 10008



app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
// 开放文件夹
app.use('/node_modules/',express.static('./node_modules'))
app.use('/public/', express.static('./public'))
app.use('/static/', express.static('./views/static'))
// art-template
app.engine('html', require('express-art-template'))

//passport 初始化
app.use(passport.initialize())
//数据分离 把passport传过去了
require('./utils/passport')(passport)

//设置跨域访问
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
    res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization,Origin,Accept,X-Requested-With,X-Token')
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    res.header('Access-Control-Allow-Credentials', true)
    res.header('X-Powered-By', ' 3.2.1')
    // res.header('Content-Type', 'application/json;charset=utf-8')
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next()
    }
})
// f2f - alipay
const config = require('./alipayF2f/alipayF2fConfig')
const alipayf2f  = require('./alipayF2f/alipayF2f')
//压缩请求
app.use(require("compression")())
app.use((req, res, next) => {
    req.config    = config;
    req.alipayf2f = new alipayf2f(config);
    next();
})

app.use(sdk)
app.use(core)
app.use(android)
app.use(users)
app.use(orders)
app.use(qrcodes)
app.use(alipayF2fNotify)
app.use((req, res) => res.status(404).send("404 Not Found"));
app.listen( port)