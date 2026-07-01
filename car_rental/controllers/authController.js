// controllers/authController.js
const carModel = require("../models/carModel");

// Hiển thị trang đăng ký
function showRegister(req, res) {
    res.render("register", { error: null, success: null });
}

// Xử lý khi người dùng nhấn nút "Đăng ký"
async function register(req, res) {
    const { username, password, fullName } = req.body;

    // Giả lập kiểm tra xem tài khoản đã tồn tại chưa
    // (Sau này bạn thay bằng câu lệnh truy vấn DB: await User.findOne({ username }))
    if (username === "sinhvien") {
        return res.render("register", { 
            error: "Tài khoản này đã tồn tại trên hệ thống!", 
            success: null 
        });
    }

    // Nếu hợp lệ, tiến hành thêm tài khoản mới vào hệ thống giả lập
    // (Trong thực tế bạn dùng câu lệnh: await User.create({ username, password, fullName }))
    // Ở đây mình tạm bỏ qua bước lưu thực tế vì database đang là mock cứng, mục tiêu là trả về thông báo thành công
    
    res.render("register", { 
        error: null, 
        success: "Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay." 
    });
}

// Hiển thị trang đăng nhập
function showLogin(req, res) {
    res.render("login", { error: null });
}

// Xử lý khi user bấm nút Login
async function login(req, res) {
    const { username, password } = req.body; // Lấy dữ liệu từ thẻ form POST (ExpressJS.pdf - Page 21)
    
    const user = await carModel.checkLogin(username, password);

    if (user) {
        // Nếu đúng: Lưu thông tin vào Session để đánh dấu đã đăng nhập
        req.session.currentUser = {
            id: user.id,
            username: user.username,
            fullName: user.fullName
        };
        return res.redirect("/cars"); // Đăng nhập xong quay về trang chủ
    } else {
        // Nếu sai: Hiển thị lại trang login kèm thông báo lỗi
        res.render("login", { error: "Tài khoản hoặc mật khẩu không chính xác!" });
    }
}


// Xử lý Đăng xuất
function logout(req, res) {
    req.session.destroy(); // Xóa sạch session
    res.redirect("/auth/login");
}

module.exports = { showLogin, login, logout, showRegister, register };