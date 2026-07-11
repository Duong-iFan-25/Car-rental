const userModel = require("../models/userModel")

// Hiển thị form đăng nhập.
function showLogin(req, res) {
    // req.query.registered xuất hiện sau khi đăng ký thành công.
    const message = req.query.registered ? "Đăng ký thành công. Bạn hãy đăng nhập" : null
    res.render("login", { error: null, message: message })
}

// Nhận email và mật khẩu từ form đăng nhập.
async function login(req, res) {
    try {
        const email = req.body.email
        const password = req.body.password

        // Nhờ model kiểm tra tài khoản trong bảng users.
        const user = await userModel.checkLogin(email, password)

        if (!user) {
            return res.render("login", {
                error: "Sai email hoặc mật khẩu",
                message: null
            })
        }

        // Lưu thông tin cần thiết vào session để ghi nhớ đăng nhập.
        req.session.user = {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role
        }

        // Admin vào Dashboard, người dùng thường vào danh sách xe.
        if (user.role === "admin") {
            return res.redirect("/admin")
        }

        res.redirect("/cars")
    } catch (error) {
        console.log(error)
        res.send("Lỗi đăng nhập")
    }
}

// Hiển thị form đăng ký với dữ liệu ban đầu là rỗng.
function showRegister(req, res) {
    res.render("register", {
        error: null,
        formData: {
            full_name: "",
            email: "",
            phone: ""
        }
    })
}

// Nhận và xử lý dữ liệu do form đăng ký gửi lên.
async function register(req, res) {
    try {
        const full_name = req.body.full_name
        const email = req.body.email
        const password = req.body.password
        const confirm_password = req.body.confirm_password
        const phone = req.body.phone

        // Giữ lại dữ liệu để người dùng không phải nhập lại khi có lỗi.
        const formData = {
            full_name: full_name,
            email: email,
            phone: phone
        }

        // Kiểm tra các trường bắt buộc.
        if (!full_name || !email || !password) {
            return res.render("register", {
                error: "Vui lòng nhập đầy đủ thông tin",
                formData: formData
            })
        }

        // Hai lần nhập mật khẩu phải giống nhau.
        if (password !== confirm_password) {
            return res.render("register", {
                error: "Mật khẩu nhập lại không khớp",
                formData: formData
            })
        }

        // Không cho phép hai tài khoản dùng chung một email.
        const oldUser = await userModel.findByEmail(email)

        if (oldUser) {
            return res.render("register", {
                error: "Email đã tồn tại",
                formData: formData
            })
        }

        // Dữ liệu hợp lệ thì thêm người dùng và chuyển sang đăng nhập.
        await userModel.createUser(full_name, email, password, phone)
        res.redirect("/login?registered=1")
    } catch (error) {
        console.log(error)
        res.render("register", {
            error: "Không thể đăng ký tài khoản",
            formData: req.body
        })
    }
}

// Xóa session hiện tại để đăng xuất.
function logout(req, res) {
    req.session.destroy(() => {
        res.redirect("/login")
    })
}

module.exports = {
    showLogin,
    login,
    showRegister,
    register,
    logout
}
