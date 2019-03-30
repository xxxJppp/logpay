var mysql = require('mysql')
//1,建立连接
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'users'
})
//2，链接数据库
connection.connect()

//3，执行数据库操作 打开冰箱
connection.query('SELECT * FROM `users`', function (error, results, fields) {
  if (error) throw error
  console.log('The solution is: ', results)
})
// connection.query('INSERT INTO users VALUES(NULL,"admin","123456")', function (error, results, fields) {
//     if (error) throw error
//     console.log('The solution is: ', results)
//   })

//关闭连接 关闭冰箱
connection.end()