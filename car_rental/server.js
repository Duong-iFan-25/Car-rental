// server.js
const express = require("express");
const session = require("express-session"); // Quản lý trạng thái (Cookie-session.pdf)
const path = require("path");

const app = express();

// 1. Cấu hình Template Engine EJS (Express MVC.pdf - Page 4)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 2. Middleware đọc dữ liệu form POST và phục vụ file tĩnh (ExpressJS.pdf - Page 21, 22)
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// 3. Cấu hình Session để giữ trạng thái đăng nhập
app.use(session({
    secret: "my_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 } // Session tồn tại trong 1 tiếng
}));

// 4. Nhập các Route từ thư mục routes/
const carRoutes = require("./routes/carRoute");
// const authRoutes = require("./routes/authRoute"); // Bạn tự mở rộng sau nhé

// 5. Gắn Route vào ứng dụng
app.use("/cars", carRoutes);

// Route mặc định chuyển hướng về trang danh sách xe
app.get("/", (req, res) => {
    res.redirect("/cars");
});

// Khởi chạy server (Giới thiệu NodeJS.pdf - Page 12)
app.listen(3000, () => {
    console.log("Server đang chạy tại cổng: http://localhost:3000");
});