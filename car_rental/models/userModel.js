// Model chỉ phụ trách làm việc với database.
const db = require("../config/db")

// Thêm một tài khoản người dùng mới, role mặc định là user.
async function createUser(full_name, email, password, phone) {
    await db.query(
        "INSERT INTO users(full_name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)",
        [full_name, email, password, phone, "user"]
    )
}

// Tìm tài khoản theo email để kiểm tra email trùng.
async function findByEmail(email) {
    const [users] = await db.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
    )

    return users[0] || null
}

// Tìm tài khoản có email và mật khẩu khớp với form đăng nhập.
async function checkLogin(email, password) {
    const [users] = await db.query(
        "SELECT * FROM users WHERE email = ? AND password = ?",
        [email, password]
    )

    return users[0] || null
}

module.exports = {
    createUser,
    findByEmail,
    checkLogin
}
