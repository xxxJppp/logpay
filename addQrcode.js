const Qrcode = require('./models/Qrcodes')
// 照片文字识别
const client = require('./config/baiduOcr')
const request = require('request')
const jsQR = require("jsqr")
const Jimp = require('jimp')
process.on('message', async (remoteData) => {
		let params = remoteData
		console.log(remoteData)
        if (params.url == '') {
            throw ('参数丢失!')
        }
		let { pid } = params
		// 百度Ocr
		const readTxt = (url) => {
			return new Promise((resolve, reject) => {
				client.webImageUrl(url)
					  .then(data => {
						resolve(JSON.stringify(data))
					})
					  .catch( err => {
						  reject(err)
						  process.send({
							  code: -1,
							  msg: '网关层文字识别失败请重试'+ err,
							  errData: err
						  })
						  	try {
								process.kill(pid,'SIGTERM')
							} catch(e) {
								console.log(e)
							}
					  })//网络发生错误
			})
		}
		// add函数集合
		const qrcodeAdd = async (params, Qrcode, request, jsQR, Jimp) => {
				let payData = { type: '', price: '不固定金额', payUrl: '',}
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
						process.send({
							  code: -1,
							  msg: '请求图片url失败'+ error,
							  errData: error
						})
						try {
							process.kill(pid,'SIGTERM')
						} catch(e) {
							console.log(e)
						}
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
								reject('二维码识别失败')
								process.send({
								  code: -1,
								  msg:'二维码识别失败'
							 })
								try {
									process.kill(pid,'SIGTERM')
								} catch(e) {
									console.log(e)
								}
							}
						  })
						  .catch( err => {
							  reject(err)
							  process.send({
								  code: -1,
								  msg:err,
								  errData: err
							 })
							try {
								process.kill(pid,'SIGTERM')
							} catch(e) {
								console.log(e)
							}
						  })
			})
		}
		let url = await qrdecode(imageDataBase64)
		payData.payUrl = url
		Qrcode.findOne({ uid:params.uid, phoneId:params.phoneId, type:payData.type, price:payData.price})
			  .then( data => {
				  if (data) {
//					  res.json({
//						  code:-1,
//						  data:'',
//						  msg:'该二维码已经上传'
//					  })
						  process.send({
							  code: -1,
							  data:'',
							  msg: '该二维码已经上传'
						 })
						try {
							process.kill(pid,'SIGTERM')
						} catch(e) {
							console.log(e)
						}
					} else {
					let qrcode = new Qrcode({
						uid:params.uid,
						phoneId: params.phoneId,
						type:payData.type,
						price:payData.price,
						payUrl:payData.payUrl
					})
					qrcode.save()
						.then( data => {
	//                        remoteData.json({
	//                            code: 1,
	//                           data:'',
	//                            msg: '上传成功'
	//                        })
							process.send({
								code: 1,
								data:'',
								msg: '上传成功'
							})
							try {
								process.kill(pid,'SIGTERM')
							} catch(e) {
								console.log(e)
							}
						})
						.catch( err => {
	//					    res.json({
	//							code: -1,
	//							msg: '系统繁忙请稍等' + err,
	//							errData: err
	//					  })
							process.send({
								code: -1,							
								msg: '系统繁忙请稍等' + err,
								errData: err
						})
							try {
								process.kill(pid,'SIGTERM')
							} catch(e) {
								console.log(e)
							}
						})
					}})
					.catch( err => {
	//					res.json({
	//						code: -1,
	//						msg: '系统繁忙请稍等' + err,
	//						errData: err
	//					})
						process.send({
								code: -1,							
								msg: '系统繁忙请稍等' + err,
								errData: err
						})
						try {
							process.kill(pid,'SIGTERM')
						} catch(e) {
							console.log(e)
						}
				})
		}
		let data = {}
		data = JSON.parse(await readTxt(params.url))
		if (data.words_result) {
			qrcodeAdd(params, Qrcode, request, jsQR, Jimp)
		} else {
			var timer = setInterval( async() => {
				data = JSON.parse(await readTxt(params.url))
				if (data.words_result) {
					clearInterval(timer)
				}
				qrcodeAdd(params, Qrcode, request, jsQR, Jimp)
			}, 800)
		}
})