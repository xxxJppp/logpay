const express = require('express')
const router = express.Router()
const Qrcode = require('../../models/Qrcode')
// 照片文字识别
const client = require('../../config/baiduOcr')
const request = require('request')
const jsQR = require("jsqr")
const Jimp = require('jimp')
const qiniu = require('qiniu')
const readTxt = (url) => {
    return new Promise((resolve, reject) => {
        client.webImageUrl(url)
              .then(data => {
                resolve(JSON.stringify(data))})
              .catch( err => reject(err))//网络发生错误
    })
}

// 上传千牛
router.post('/qrcode/updata', async (req, res) => {
    let accessKey = 'PNUr2OcReNzJ1Hlsbq3Vhii3DA_GqKHou9m2JFlb'
    let secretKey = 'zASSRnXVRNQsFf2FNvLtL0Oe0msLQf8WsK_4ahLn'
    let bluck = '88888888'
    let mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
    let options = {
        scope: bluck, // 空间名
        expires: 7200
    }
    let putPolicy = new qiniu.rs.PutPolicy(options)
    let uploadToken = putPolicy.uploadToken(mac)
    res.send({
        code: 1,
        data: {
            toKen: uploadToken,
        },
        msg: '请求成功!'
    })
})


router.post('/qrcode/add', async (req, res) => {
    try {
        let params = req.body
        if (params.url == '') {
            throw ('参数丢失!')
        }
        let data = JSON.parse(await readTxt(params.url))
        let payData = { type: '', price: '不固定金额', pay_url: '',}
        data.words_result.forEach(element => { // 识别付款码文字信息
            if (element.words.includes('支付就用支付宝')) {
                payData.type = '支付宝'
            }
            else if (element.words.includes('推荐使用微信')) {
                payData.type = '微信'
            }
            if (element.words.includes('￥')) {
                payData.price = element.words.substring(1)
            }
        })
        if (payData.type === '') {
            throw ('二维码有误，请上传支付宝或微信收款二维码!')
        }
        if (payData.price <=0 ) {
            throw ('二维码有误，请上传支付宝或微信收款二维码!')
        }
        // 识别付款码支付url
        let imgData = (url) => {
            return new Promise((resolve, reject) => {
                request.get({
                    url: url,
                    encoding: null // 指定编码
                }, (error, response, body) => {
                    if (error) {
                        reject('请求图片url失败')
                    } else {
                        resolve(body)
                    }
                })
            })
        }
        let imageDataBase64 = await imgData(params.url)
        // 提取二维码中的url
        const qrdecode = (file) => {
            return new Promise(async (resolve,reject) => {
                await Jimp.read( await file )
                          .then(image => {
                            const qrCodeImageArray = new Uint8ClampedArray(image.bitmap.data.buffer)
                            const qrCodeResult = jsQR(
                                qrCodeImageArray,
                                image.bitmap.width,
                                image.bitmap.height
                            )
                            if (qrCodeResult) {
                                return resolve(qrCodeResult.data)
                            } else {
                                return reject('二维码识别失败！')
                            }
                          })
                          .catch( err => reject(err))
            })
        }
        let url = await qrdecode(imageDataBase64)
            payData.pay_url = url
        Qrcode.findOne( { uid:params.uid, type:payData.type, price:payData.price } )
              .then( data => {
                  if (data) {
                      res.json({
                          code:-1,
                          data:'',
                          msg:'该二维码已经上传!'
                      })
                  } else {
                  let qrcode = new Qrcode({
                    uid:params.uid,
                    type:payData.type,
                    price:payData.price,
                    pay_url:payData.pay_url
                })
                qrcode.save()
                      .then( data => {
                        res.json({
                            code: 1,
                            data:'',
                            msg: '上传成功!'
                        })
                      })
                      .catch( err => console.log(err))
                    }
              })
              .catch( err => console.log(err) )
    } catch (e) {
        res.json({
            code: -1,
            msg: e,
            data: ''
        })
    }
})
    
router.get('/qrcode/all', async (req, res) => {
    try {
        let params = req.query
        if (parseInt(params .page) != params.page && parseInt(params.num) != params.num) {
            throw ('参数有误!')
        }
        Qrcode.find({uid:params.uid})
              .then( result =>{
                let skip = (parseInt(params.page-1))*parseInt(params.num)
                let limit = parseInt(params.num)
                Qrcode.find({ uid:params.uid })
                      .skip(skip)
                      .limit(limit) 
                      .exec()
                      .then( data => {
                        if (!data) throw ('无数据!')
                        res.json({
                          code: 1,
                          data: {
                              data,
                              result
                          },
                          msg: '获取成功!'
                      })
                    })
                      .catch( err => console.log(err))
              })
              .catch( err => console.log(err))
    } catch (e) {
        res.json({
            code: -1,
            data: '',
            msg: e
        })
    }
})

router.delete('/qrcode/del', async (req, res) => {
    try{
        let params = req.body
        Qrcode.deleteOne({_id:params.id})
              .then( data => {
              res.json({
                  code: 0,
                  data: '',
                  msg: '删除成功!'
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

module.exports = router;

























// const readTxt = (url) => {
//     return new Promise((res, rej) => {
//         client.generalBasicUrl(url)
//               .then(data => {
//            res(JSON.stringify(data))
//         }).catch(err => {
//             // 如果发生网络错误
//             rej(err);
//         })
// function readTxt( url, callback ) {
//     client.generalBasicUrl(url, (err, data) =>{
//         if (err) {
//             return callback(err,null)
//         }
//        return callback(null,data)
//     })
// }
// function codeUrl( url, callback ) {
//     client.generalBasicUrl(url, (err, data) =>{
//         if (err) {
//             return callback(err,null)
//         }
//        return callback(null,data)
//     })
// }

// router.get('/add',(req, res)=>{
//     let data = req.body
//     if (data.url == '') throw ('参数丢失!')
//     readTxt( data.url,( err,data )=>{
//         if (err) return err
//         let payData = {type: 'wechat', price: 0, pay_url: '',}
//         data.words_result.forEach(e => { // 识别付款码文字信息
//             if (e.words.indexOf('支付就用支付宝') != -1) {
//                 payData.type = 'alipay'
//             }
//             if (e.words.indexOf('￥') != -1) {
//                 console.log(e.words)
//                 payData.price = e.words.substring(1)
//             }
//         })
//         if (payData.price <=0 ) {
//             throw ('二维码有误，请上传支付宝或微信收款二维码!')
//         }
//     })
//     // 识别支付二维码
// })

// module.exports = router