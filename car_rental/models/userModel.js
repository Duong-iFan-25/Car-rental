// Model chỉ phụ trách làm việc với database.
const db = require("../config/db")

// Thêm một tài khoản người dùng mới, role mặc định là user.
async function createUser(full_name, username, password, phone) {
    await db.query(
        "INSERT INTO users(full_name, username, password, phone, role) VALUES (?, ?, ?, ?, ?)",
        [full_name, username, password, phone, "user"]
    )
}

// Tìm tài khoản theo username để kiểm tra tên tài khoản trùng.
async function findByUsername(username) {
    const [users] = await db.query(
        "SELECT * FROM users WHERE username = ?",
        [username]
    )

    return users[0] || null
}

// Tìm tài khoản có username và mật khẩu khớp với form đăng nhập.
async function checkLogin(username, password) {
    const [users] = await db.query(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [username, password]
    )

    return users[0] || null
}

module.exports = {
    createUser,
    findByUsername,
    checkLogin
}
