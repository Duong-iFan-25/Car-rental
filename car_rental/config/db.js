const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Trinhduong2005@",
  database: "car",
});

module.exports = db;
