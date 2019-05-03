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
        required: true
    },
    uid: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    meal: {
        type: String,
        required: true,
		default: 'mf'
    },
    mealtime: {
        type: String,
        required: true,
		default: '-'
    },
    money: {
        type: String,
        required: true,
        default:'0.00'
    },
	renew: {
		type: Boolean,
		require: true,
		default: true
	},
	roles: {
		type: Array,
		default: ['merchant']
	},
	ip: {
		type: String,
		require: false
	},
	remark: {
		type: String,
		require: false
	},
	address: {
		type: String,
		require: false
	}
})

let User = mongoose.model('User', userSchema)


module.exports = User