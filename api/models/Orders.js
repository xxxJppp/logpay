// 配置mongoose
let mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/mqpay', { useNewUrlParser:true })
// 设计架构模式
let Schema = mongoose.Schema
let orderSchema = new Schema({
    // 商户ID,后台可查
    uid: {
        type:String,
        required: true
    },
    payType: {
        type: String,
        required: true
    },
    orderUid: {
        type: String,
        required: false
    },
    orderName: {
        type: String,
        required: false
    },
    price: {
        type: String,
        required: true
    },
    payPrice: {
        type:String,
        required: false
    },
    payTime:{
        type:String,
        default: '未支付'
    },
    notifyUrl: {
        type: String,
        required: true
    },
    returnUrl: {
        type: String,
        required: false
    },
    signs: {
        type: String,
        required: true
    },
    callbackSign: {
        type: String,
        required: false
    },
    orderNumber: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        required: true
    },
    expire: {
        type: Number,
        required: false
    },
    fee: {
        type: String,
        required: true
    },
    pid:{
        type:Number,
        required:false
    },
    createTime:{
        type:Date,
        required:true
    },
	Pid:{
		type:Number,
		require:false
	},
	ip: {
		type:String,
		require: false
	},
	merchantIp: {
		type:String,
		require: true
	},
	qrCode: {
		type:String,
		require: false
    },
    phoneId: {
        type:String,
        require: false
    }
})

let Order = mongoose.model('Order', orderSchema)


module.exports = Order