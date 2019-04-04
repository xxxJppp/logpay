// 配置mongoose
let mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/mqpay', { useNewUrlParser: true })

// 设计架构模式
let Schema = mongoose.Schema
let qrcodeSchema = new Schema({
    uid: {
        type:String,
        required: true
    },
    type: {
        type:String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    payUrl: {
        type: String,
        required: true
    }
})

let Qrcode = mongoose.model('Qrcode', qrcodeSchema)


module.exports = Qrcode