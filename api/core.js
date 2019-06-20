const Tools = require('./utils/utils')
const core = require('./function/coreFunc')
const Qrcode = require('./models/Qrcodes')
const PhoneId = require('./models/PhoneIds')
const Order = require('./models/Orders')
// 引用工具
let tools = new Tools()
// 16进制编码
function encodeUrl (data) {
let str = data.split('').map(v=>{
	return v.charCodeAt().toString(16)
})
str = str.join('')
let arr = []
while (str.length > 0) {
	arr.push(str.substring(0, 2))
	str = str.substring(2, str.length)
}
return ('%' + arr.join('%')).toUpperCase()
}
let { orderNumberFind, orderFind, getUserMeal, getMfFee, getPayFee, getOtherFee, priceSort, orderSave, getPhoneArr, mathTest, rand } = core
process.on('message', async (remoteData) => {
let { uid, price, orderNumber, pid, payType, notifyUrl, returnUrl, sign, orderUid, orderName, ip, format, merchantIp} = remoteData
//获取html页面
const showHtml = (payType, uid, phoneId, price, payPrice, orderNumber, expire, createTime) => {
    createTime = createTime.substring(0, 10) + ' ' + createTime.substring(11, 19)
    if (payType === 'alipay') {
        PhoneId.findOne({uid, id:phoneId})
            .then( phone =>{
                if (!phone) {
                    return false
                }
                // 如果没有useid
                if(phone.userid) {
//						let alipayCodeUrl = 'alipays://platformapi/startapp?appId=20000123&actionType=scan&biz_data={"s":"money","u":"'+ phone.userid +'","a":"'+payPrice+'","m":""}'
                    let alipayCodeUrl = 'https://api.logpay.cn/server/api/alipay?u='+ phone.userid + '&a='+ payPrice+'&_s=web-other'  
                let h5Url = 'https://render.alipay.com/p/s/i?scheme=' + encodeUrl( 'alipays://platformapi/startapp?saId=10000007&qrcode=' + encodeUrl('https://api.logpay.cn/server/api/alipayH5?u='+ phone.userid + '&a='+ payPrice+'&_s=web-other'))
                    if ( format && format == 'json' ) {
                        process.send({type:'json',ctx:{
                            code: 1,
                            msg: '获取成功',
                            payUrl: alipayCodeUrl
                        }})
                    } else {
                    process.send({ type:'render',render:'alipay.html',ctx:{
                            createTime:createTime,
                            money: payPrice,
                            price: price,
                            payPrice: payPrice,
                            orderNumber: orderNumber,
                            codeUrl: alipayCodeUrl,
                            expire: expire,
                            uid:uid,
                            goAlipay:h5Url
                        }})
                    }
                    } else {
                    Qrcode.findOne({price:payPrice, phoneId, uid, type:'支付宝'})
                            .then( qrcode =>{
                                if (!qrcode) {
                                    Qrcode.findOne({price:'不固定金额', uid, phoneId, type:'支付宝'})
                                        .then( code =>{
                                            if ( format && format == 'json' ) {
                                                process.send({type: 'json',ctx: {
                                                    code: 1,
                                                    msg: '获取成功',
                                                    payUrl: code.payUrl
                                                }})
                                            } else {
                                                process.send({ type:'render',render:'alipay.html',ctx:{
                                                createTime:createTime,
                                                money: '请手动输入 '+ payPrice,
                                                price: price,
                                                payPrice: payPrice,
                                                orderNumber: orderNumber,
                                                codeUrl: code.payUrl,
                                                expire: expire,
                                                uid:uid,
                                                goAlipay: 'alipays:plantformapi'
                                            }})
                                            }
                                        })
                                        .catch(err => process.send({type:'json',ctx:'配置错误!请您配置支付宝不固定额收款码!'}))
                                } else {
                                    if ( format && format == 'json' ) {
                                        process.send({type:'json',ctx:{
                                            code: 1,
                                            msg: '获取成功',
                                            payUrl: qrcode.payUrl
                                        }})
                                    } else {
                                    process.send({type:'render',render:'alipay.html',ctx:{
                                        createTime:createTime,
                                        money: payPrice,
                                        price: price,
                                        payPrice: payPrice,
                                        orderNumber: orderNumber,
                                        codeUrl: qrcode.payUrl,
                                        expire: expire,
                                        uid:uid,
                                        goAlipay: 'alipays:plantformapi'
                                    }})
                                    }
                    }
                })
                .catch( err =>process.send({type:'json',ctx:'ali-qr-find-error'}))
                }
            })
            .catch( err=> process.send({type:'json',ctx:'ali-uid-find-error'}))
        }
    if (payType === 'wxpay') {
        Qrcode.findOne({price:payPrice, uid, phoneId, type:'微信'})
                .then( qrcode =>{
                    if (!qrcode) {
                        Qrcode.findOne({price:'不固定金额', uid, phoneId, type:'微信'})
                            .then( code =>{
                                if ( format && format == 'json' ) {
                                    process.send({type:'json',ctx:{
                                        code: 1,
                                        msg: '获取成功',
                                        payUrl: code.payUrl
                                    }})
                                } else {
                                    process.send({type:'render',render:'wxpay.html',ctx:{
                                    createTime:createTime,
                                    money: '请手动输入 '+payPrice,
                                    price: price,
                                    payPrice: payPrice,
                                    orderNumber: orderNumber,
                                    codeUrl: code.payUrl,
                                    expire: expire,
                                    uid:uid
                                }})
                                }
                            })
                            .catch(err => process.send({type: 'json',ctx: '配置错误!请您配置微信不固定额收款码!'}))
                    } else {
                        if ( format && format == 'json' ) {
                            process.send({type:'json',ctx:{
                                code: 1,
                                msg: '获取成功',
                                payUrl: qrcode.payUrl
                            }})
                        } else {
                        process.send({type:'render',render:'wxpay.html',ctx:{
                            createTime:createTime,
                            money: payPrice,
                            price: price,
                            payPrice: payPrice,
                            orderNumber: orderNumber,
                            codeUrl: qrcode.payUrl,
                            expire: expire,
                            uid:uid
                        }})
                        }
                    }
                })
                .catch( err =>process.send({type:'json',ctx:'wx-qr-find-error'}))
    }
    if (payType === 'lakala') {
        Qrcode.findOne({price:'不固定金额', uid, phoneId, type:'拉卡拉'})
            .then( code =>{
                let h5Url = 'https://render.alipay.com/p/s/i?scheme=' + encodeUrl( 'alipays://platformapi/startapp?saId=10000007&qrcode=' + encodeUrl(code.payUrl +'?_s=web-other'))
                if ( format && format == 'json' ) {
                    process.send({ type:'json',ctx:{
                        code: 1,
                        msg: '获取成功',
                        payUrl: code.payUrl
                    }})
                } else {
                    process.send({type:'render',render:'lakala.html',ctx:{
                    createTime:createTime,
                    money: '请手动输入 '+payPrice,
                    price: price,
                    payPrice: payPrice,
                    orderNumber: orderNumber,
                    codeUrl: code.payUrl,
                    expire: expire,
                    uid:uid,
                    goAlipay: h5Url
                }})
                }
            })
            .catch(err => process.send({ type: 'json', ctx: '配置错误!请您配置拉卡拉不固定额收款码!'}))
    }
}
if (!uid) {
    process.send({ type: 'json',ctx: '缺少uid参数'})
    try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e) }
}
if (!price) {
    process.send({ type: 'json', ctx: '缺少price参数'})
    try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e) }
}
if (!payType) {
    process.send({ type: 'json', ctx: '缺少payType参数'})
    try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e) }
}
if (!orderNumber) {
    process.send({ type: 'json', ctx: '缺少orderNumber参数'})
    try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e) }
}
if (!notifyUrl) {
    process.send({ type: 'json', ctx: '缺少notifyUrl参数'})
    try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e) }
}
// 获取指定用户的token
let token = tools.getToken(uid)
// 首次加密
let signs =  tools.md5( price + payType + orderUid + orderName + orderNumber + notifyUrl + returnUrl + uid + token)
price = parseFloat(price).toFixed(2)
if(isNaN(price) || price <= 0) {
    process.send({ type: 'json', ctx: "金额输入错误"})
    try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e) }
}
let fee
let payPrice
if (!payPrice) {
   payPrice = price        
}
// 免签
let o = await orderNumberFind( orderNumber, uid, orderUid, payType, price, payPrice ).catch(err => { process.send({ type: 'json', ctx: err}) 
try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e) } })
if (o) {
    if (o.status === 2) {
    process.send({ type: 'json', ctx: '订单已支付!'})
    try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e) }
    }
    if (o.status === 1) {
        process.send({ type: 'json', ctx: '回调通知失败,请联系客服!'})
        try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e) }      
    }
    if (o.status === -1) {
        if (o.expire === 0) {
            process.send({ type: 'json', ctx: '订单已过期!,请重新发起支付!'})
            try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e) }      
        } else if (o.expire < 300 && o.expire > 0) {
            let { payType, phoneId, payPrice, price, orderNumber, expire, uid, createTime } = o
            showHtml(payType, uid, phoneId, price, payPrice, orderNumber, expire, createTime.toISOString())
        } else if (o.expire === 300) {
            try {
                process.kill(o.pid)
            } catch (e) {
                console.log(e)
            }
            Order.deleteOne({orderNumber:o.orderNumber})
                 .then(order=>{ process.send({ type: 'json', ctx: '系统繁忙!'})
                 try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e) }})
                 .catch( err=>{ process.send({ type: 'json', ctx: '300处理失败!'}) 
                 try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e) }})
        }
    }
}
if (!o) {
       let existOrder = await orderFind(uid, orderUid, ip, payType, price).catch(err => { process.send({ type: 'json', ctx: err}) 
       try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e)}})
       if (!existOrder) {
           //套餐的fee计算
                if(uid !== '10001') {
                    let merchant = await getUserMeal(uid).catch(err => { process.send({ type: 'json', ctx: err}) 
                    try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e)}})
                    if (merchant.meal == 'mf') {
                        fee = await getMfFee(price).catch(err => { process.send({ type: 'json', ctx: err}) 
                        try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e)}})
                    } else if (merchant.meal == 'bz') {
                        fee = await getPayFee('bz', merchant, uid, price).catch(err => { process.send({ type: 'json', ctx: err}) 
                        try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e)}})
                    } else if (merchant.meal == 'gj') {
                        fee = await getPayFee('gj', merchant, uid, price).catch(err => { process.send({ type: 'json', ctx: err}) 
                        try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e)}})
                    } else {
                        fee = await getOtherFee(merchant, price).catch(err => { process.send({ type: 'json', ctx: err}) 
                        try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e)}})
                    }
                    // 判断商户余额是否足够
                    if (parseFloat(merchant.money)-parseFloat(fee) < 0) {
                        return process.send({ type: 'json', ctx: '商户余额不足,请及时冲值!'})
                    }
                    } else {
                        fee = '0.00'
                    }
                    // 验证签名
                    if ( sign === signs ) {
                    // 价格排序算法
                    let sortOrder = await priceSort(uid, price, payType, orderNumber).catch(err => { process.send({ type: 'json', ctx: err}) 
                    try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e) } })
                    if (sortOrder.length === 0) {
                        payPrice = price
                    } else {
                    let expireArr1 = sortOrder
                    const compareMin = (property) =>{
                        return (a,b) => {
                            let value1 = a[property]
                            let value2 = b[property]
                            return value1 - value2
                        }
                    }
                    const compareMax = (property) => {
                        return (a,b) => {
                            let value1 = a[property]
                            let value2 = b[property]
                            return value2 - value1
                        }
                    }
                    let expireArr2 = expireArr1
                    expireArr1.sort(compareMin('payPrice'))
                    payPrice = expireArr1[0].payPrice - 0.01
                    // 处理算法
                    expireArr2.sort(compareMax("payPrice"))
                    if (mathTest(expireArr2, price)) {
                        payPrice = mathTest(expireArr2, price)
                    }
                    }
                    payPrice = parseFloat(payPrice).toFixed(2)
                    if(isNaN(payPrice) || payPrice <= 0) {
                        return process.send({ type: 'json', ctx: "请稍后再试"})
                    }
                    // 获取启用手机数组[1,2,3]
                    let phoneArr = await getPhoneArr(uid).catch(err => { process.send({ type: 'json', ctx: err}) 
                    try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e) }})
                    let phoneLength = phoneArr.length
                    // 当 phoneArr 的长度为0即没有手机的时候返回
                    if (phoneLength === 0) {
                        process.send({ type: 'json', ctx: {
                            code: -1,
                            msg: '未配置收款手机'
                        }})
                        try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e) }
                    }
                    let phoneId = phoneArr[rand(0,phoneLength-1)]
                    // 存数据库
                    let payTime = '未支付'
                    let status = -1 //未支付状态
                    let expire = 300 //支付时间排序
                    fee = parseFloat(fee).toFixed(3)
                    let createTime = tools.localDate()
                    // 获取商户ip
                    let callbackSign = tools.md5( payPrice + price + payType + orderNumber + orderUid + signs + token )
                    let order = new Order({
                        payPrice,price,payType,orderUid,orderName,orderNumber,payTime,notifyUrl,returnUrl,uid,signs,callbackSign,status,expire,fee,pid,createTime,ip,merchantIp,phoneId
                    })
                    let successOrder = await orderSave(order).catch(err => { process.send({ type: 'json', ctx: err}) 
                    try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e) }})
                    if (successOrder) {
                        setInterval(()=>{
                            expire--
                            if (expire < 0 ) {
                                try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e) }
                            }
                            Order.updateOne({ orderNumber}, { expire })
                                 .then()
                                 .catch(err =>console.log('timer-error'))
                        },1000)
                        showHtml(payType, uid, phoneId, price, payPrice, orderNumber, expire, createTime)
                    }
                } else {
                    process.send({ type: 'json', ctx: '签名错误!'})
                    try { process.kill( pid,'SIGTERM') } catch(e) { console.log(e) }
                }
        } else {
            let { phoneId, uid, payPrice, price, payType, orderNumber, expire, createTime} = existOrder
            showHtml(payType, uid, phoneId, price, payPrice, orderNumber, expire, createTime.toISOString())
        }
}})