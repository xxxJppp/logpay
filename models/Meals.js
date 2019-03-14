// 配置mongoose
let mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/mqpay', { useNewUrlParser:true })
// 设计架构模式
let Schema = mongoose.Schema
let mealSchema = new Schema({
    mealFee: {
        type: Number,
        required: true
    },
    mealName: {
        type: String,
        required: true
    },
    mealPrice: {
        type: String,
		required: true
	},
	mealUid:{
		type: String,
		default: '-'
	}
})

let Meal = mongoose.model('Meal', mealSchema)

module.exports = Meal