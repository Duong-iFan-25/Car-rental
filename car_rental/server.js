// Nạp các thư viện cần dùng cho ứng dụng.
const express = require("express");
const session = require("express-session");
const path = require("path");

// Nạp các file route của từng chức năng.
const homeRoutes = require("./routes/homeRoutes");
const authRoutes = require("./routes/authRoutes");
const carRoutes = require("./routes/carRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Middleware dùng để đưa thông tin session sang các file EJS.
const { useSession } = require("./middlewares/authMiddleware");

// Khởi tạo ứng dụng Express và chọn cổng chạy server.
const app = express();
const port = 3000;

// Chọn EJS làm view engine để hiển thị giao diện.
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Đọc dữ liệu từ form và cho phép truy cập các file trong thư mục public.
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Session dùng để ghi nhớ người dùng sau khi đăng nhập.
app.use(
  session({
    secret: "easycar",
    resave: false,
    saveUninitialized: false,
  }),
);

// Chạy middleware session trước khi xử lý các route.
app.use(useSession);

// Gắn từng nhóm route vào đường dẫn tương ứng.
app.use("/", homeRoutes);
app.use("/", authRoutes);
app.use("/cars", carRoutes);
app.use("/bookings", bookingRoutes);
app.use("/admin", adminRoutes);

// Đường dẫn ngắn để mở danh sách đơn đặt xe của người dùng.
app.get("/my-bookings", (req, res) => {
  res.redirect("/bookings/my-bookings");
});

// Xử lý trường hợp người dùng truy cập đường dẫn không tồn tại.
app.use((req, res) => {
  res.status(404).send("Not Found");
});

// Khởi động server tại http://localhost:3000.
app.listen(port, () => {
  console.log("Server chạy tại http://localhost:" + port);
});
