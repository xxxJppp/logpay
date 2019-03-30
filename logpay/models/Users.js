// 配置mongoose
let mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/mqpay', { useNewUrlParser: true })

// 设计架构模式
let Schema = mongoose.Schema
let userSchema = new Schema({
    email: {
        type:String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    uid: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    userid: {
        type: String,
        required: false
    },
    meal: {
        type: String,
        required: true
    },
    mealtime: {
        type: String,
        required: true
    },
    money: {
        type: String,
        required: true
    }
})

let User = mongoose.model('User', userSchema)


module.exports = User