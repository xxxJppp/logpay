//引入mongoose
const mongoose = require('mongoose')
var Schema = mongoose.Schema  //架构，模式
mongoose.connect('mongodb://localhost/itcast')

//设计集合结构（表结构）
//字段名称就是表结构中的属性名称
//值

//这是每个文档的结构
// var blogSchema = new Schema({
//     title: String,
//     author: String,
//     comments: [{body:String,data:Date}],
//     data:{type:Date,default:Date.now},
//     hidden:Boolean,
//     meta: {
//         votes: Number,
//         favs: Number
//     }
// })//约束的目的是为了保证数据的完整性，不要有脏数据

var userSchema = new Schema({
    username: {
        type:String,
        required:true //必须要有
    },
    password: {
        type: String,
        required:true
    },
    email: {
        type: String
    }
})

//3,将文档结构发布为模型
var User = mongoose.model('User',userSchema)
//mongoose.model方法就是用来将一个架构发布为model
//第一个参数：传入一个大写开头的英文字母单数字符串来表示你的集合名称，例如User最终会变成users的集合名称
//第二个参数：架构Schema

//返回值：模板构造函数

//4，当我们有了模型构造函数之后，就可以使用这个构造函数对 users 集合中的数据为所欲为了
// var admin= new User({
//     username:'zs',
//     password:'123456',
//     email:'admin@admin.com'
// })

// admin.save((error,result)=> {
//     if(error) {
//         console.log('有问题')
//     }else {
//         console.log('成功')
//         console.log(result)
//     }
// })


//查询
User.find({
    username:'ww'
},(err,result)=> {
    if (err) {
        console.log('错误')
    }else {
        console.log(result)
    }
})

//删除
// User.remove({
//     username:'zs'
// },(err,result)=> {
//     if (err) {
//         console.log('删除失败')
//     }else {
//         console.log(result)
//     }
// })

//更新
// User.findByIdAndUpdate('5bace8c6f3fc700a700c2bc4',{
//     username:'ww',
//     password:'123456789'
// },(err,result)=> {
//     if (err) {
//         console.log('更新失败')
//     }else {
//         console.log(result)
//     }
// })


//增删改差