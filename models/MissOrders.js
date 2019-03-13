// 配置mongoose
let mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/mqpay', { useNewUrlParser:true })
// 设计架构模式
let Schema = mongoose.Schema
let missOrderSchema = new Schema({
    uid: {
        type: String,
        required: true
    },
    payType: {
        type: String,
        required: true
    },
    pay_price: {
        type: String,
		required: true
	},
    createTime: {
        type: Date,
        required:true
    }
})

let MissOrder = mongoose.model('MissOrder', missOrderSchema)

module.exports = MissOrder