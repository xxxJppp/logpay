// 配置mongoose
let mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/mqpay', { useNewUrlParser:true })
// 设计架构模式
let Schema = mongoose.Schema
let phoneIdsSchema = new Schema({
    uid: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    userid: {
        type: String,
        required: false
    },
    open: {
        type: Boolean,
        default: true
    },
    wxpayLimit: {
        type: String,
        default: null
    },
    alipayLimit: {
        type: String,
        default: null
    }
})

let PhoneId = mongoose.model('PhoneIds', phoneIdsSchema)
module.exports = PhoneId