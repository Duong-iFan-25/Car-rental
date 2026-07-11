// Phiên bản promise giúp model có thể dùng async/await.
const mysql = require("mysql2/promise")

// Pool quản lý và tái sử dụng các kết nối tới MySQL.
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Trinhduong2005@",
    database: "car"
})

// Các model sẽ require file này để chạy câu lệnh SQL.
module.exports = db
