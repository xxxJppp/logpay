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
        required: true
    },
    orderName: {
        type: String,
        required: false
    },
    price: {
        type: String,
        required: true
    },
    pay_price: {
        type:String,
        required: true
    },
    pay_time:{
        type:String,
        default: '未支付'
    },
    notify_url: {
        type: String,
        required: true
    },
    return_url: {
        type: String,
        required: true
    },
    sign1: {
        type: String,
        required: true
    },
    sign2: {
        type: String,
        required: false
    },
    orderNumber: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        required: true
    },
    expire: {
        type: Number,
        required: true
    },
    fee: {
        type: String,
        required: true
    },
    pid:{
        type:Number,
        required:true
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
	}
})

let Order = mongoose.model('Order', orderSchema)


module.exports = Order