const express = require('express')
const router = express.Router()
const Qrcode = require('../../models/Qrcodes')
var qr_image = require('qr-image');
// 照片文字识别
const client = require('../../config/baiduOcr')
const request = require('request')
const qiniu = require('qiniu')

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
        msg: '请求成功'
    })
})


router.post('/qrcode/add', async (req, res) => {
    try {
		const childProcess = require('child_process')
		let childAddQrcode = childProcess.fork('./addQrcode.js')
		let remoteData = req.body
		remoteData.pid = childAddQrcode.pid
		childAddQrcode.send(remoteData)
		childAddQrcode.on('message', function(resData) {
		  console.log(resData)
		  res.json(resData)
		})
        
    } catch (e) {
        res.json({
            code: -1,
            msg: '系统繁忙请稍等' + e,
            errData: e
        })
    }
})
    
router.get('/qrcode/all', async (req, res) => {
    try {
        let params = req.query
        if (parseInt(params .page) != params.page && parseInt(params.num) != params.num) {
            throw ('参数有误')
        }
        Qrcode.find({ uid:params.uid, phoneId:params.phoneId })
              .then( result =>{
                let skip = (parseInt(params.page-1))*parseInt(params.num)
                let limit = parseInt(params.num)
                Qrcode.find({ uid:params.uid, phoneId:params.phoneId })
                      .skip(skip)
                      .limit(limit) 
                      .exec()
                      .then( data => {
                        res.json({
                          code: 1,
                          data: {
                              data,
                              result
                          },
                          msg: '获取成功'
                      })
                    })
                      .catch( err => {
							res.json({
								code: -1,
								msg: '系统繁忙请稍等' + err,
								errData: err
							})
					  })
              })
              .catch( err => {
				    res.json({
						code: -1,
						msg: '系统繁忙请稍等' + err,
						errData: err
					})
			  })
    } catch (e) {
        res.json({
            code: -1,
            msg: '系统繁忙请稍等' + e,
            errData: e
        })
    }
})

router.delete('/qrcode/del', async (req, res) => {
    try{
        let params = req.body
        Qrcode.deleteOne({_id:params.id})
              .then( data => {
              res.json({
                  code: 1,
                  data: '',
                  msg: '删除成功'
              })})
              .catch( err => {
				res.json({
					code: -1,
					msg: '系统繁忙请稍等' + err,
					errData: err
				})
			})
    } catch (e) {
		res.json({
			code: -1,
			msg: '系统繁忙请稍等' + e,
			errData: e
		})
    }
})

// 删除指定支付方式
router.post('/qrcode/removeType', (req, res)=>{
    let {uid, phoneId, payType} = req.body
    Qrcode.deleteMany({uid,phoneId,type:payType})
            .then(qrcode=>{
                res.json({
                    code: 1,
                    msg: '删除成功'
                })
            })
            .catch(err=>{
                res.json({
                    code: -1,
                    msg:'系统繁忙请稍等' + err,
                    errData:err
                })
            })   
})
// 删除全部
router.post('/qrcode/removeAll', (req, res)=>{
    let {  uid, phoneId } = req.body
    Qrcode.deleteMany({uid, phoneId})
          .then(qrcode=>{
              res.json({
                  code: 1,
                  msg: '删除成功'
              })
          })
          .catch(err=>{
              res.json({
                  code: -1,
                  msg:'系统繁忙请稍等' + err,
                  errData:err
              })
          })
})
// 删除选中
router.post('/qrcode/removeSelect', (req, res)=>{
    let { uid, phoneId, qrcode } = req.body
    if (qrcode.length > 0) {
        // 批量删除
        Qrcode.deleteMany({_id: { $in: qrcode }, uid, phoneId})
              .then( qrcode=>{
                  res.json({
                      code:1,
                      msg:'删除成功'
                  })
              })
              .catch(err=>{
                  res.json({
                      code:-1,
                      msg:'系统繁忙请稍等' + err,
                      errData: err
                  })
              })
    } else {
        res.json({
            code:-1,
            msg:'未发现选中'
        })
    }
})
// 禁用 启用二维码
router.post('/qrcode/codeOpen', (req, res)=>{
    let {uid, phoneId, open, id, payType, selectId} = req.body
    let query = {uid, phoneId}
    if (selectId) {
        if (selectId.length > 0) {
            query._id = { $in: selectId }
        } else if (selectId.length = 0) {
            return res.json({
                code: -1,
                msg: '未发现选中'
            })
        }
    }
    if (payType) {
        query.type = payType
    }
    if (id) {
        query._id = id
    }
    console.log(query)
    Qrcode.updateMany(query, {open: open})
          .then(qrcode =>{
              if (open) {
                res.json({
                    code: 1,
                    msg: '启用成功'
                })
              } else {
                res.json({
                    code: 1,
                    msg: '禁用成功'
                })
              }
          })
          .catch(err =>{
              res.json({
                  code: -1,
                  msg:'系统繁忙请稍等'+ err,
                  errData: err
              })
          })
})

// 转二维码
router.get('/qrcode/image',async (req, res)=>{
	let data = req.query
	let imageText = data.text
	if (data.actionType) {
		imageText = imageText + '&actionType=' +data.actionType
	}
	if (data.biz_data) {
		imageText = imageText + '&biz_data=' + data.biz_data
	}
	let codeImage = qr_image.image(imageText,{type: 'png',margin: 1});
	codeImage.pipe(res)
})

router.get('/qrcode/codeBase64', async(req, res)=>{
	let imgData = (url) => {
		return new Promise((resolve, reject) => {
			request.get({
				url: url,
				encoding: null // 指定编码
			}, (error, response, body) => {
				if (error) {
					reject('请求图片url失败')
				} else {
					resolve(body.toString('Base64'))
				}
			})
		})
	}
	let imageDataBase64 = await imgData('https://api.logpay.cn/qrcode/image?text=' + req.query.text)
	res.send(imageDataBase64)
})
module.exports = router;