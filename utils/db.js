// MySQL
var mysql = require('mysql');

var pool = global.constant.DATABASE ? mysql.createPool({
  connectionLimit: global.constant.DATABASE.connectionLimit,
  host: global.constant.DATABASE.host,
  port: global.constant.DATABASE.port,
  user: global.constant.DATABASE.user,
  password: global.constant.DATABASE.password,
  database: global.constant.DATABASE.database,
}) : null;

// pool.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//   if (error) throw error;
//   console.log('>>> The solution is: ', results[0].solution);
// });

// 接收一个 sql 语句 以及所需的 values
// 这里接收第二参数 values 的原因是可以使用 mysql 的占位符 '?'
// 比如 query(`select * from my_database where id = ?`, [1])
module.exports = pool ? function (sql, values) {
  // 返回一个 Promise
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log('>>> [MySQL][ERROR] - ', err.message);
        reject(err)
      } else {
        connection.query(sql, values, (err, rows) => {
          if (err) {
            console.log('>>> [MySQL][ERROR] - ', err.message);
            reject(err)
          } else {
            resolve(rows)
          }
          // 结束会话
          connection.release()
        })
      }
    })
  })
} : null;
