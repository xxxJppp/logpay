const express = require('express')
const router = express.Router()
const Order = require('../../models/Orders') 
const jwt = require('jsonwebtoken')
const passport = require('passport')
// 注册新用户

router.get('/getOrder',(req, res)=>{
    Order.find()
    .then( data =>{
        console.log(data)
        if (!data) return false
        res.json({
            code:20000,
            data
        })
    })
    .catch( err => console.log(err) )
})

module.exports = router