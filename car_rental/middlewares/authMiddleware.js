// Chỉ cho người đã đăng nhập đi tiếp tới controller.
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/login")
    }

    next()
}

// Chỉ cho tài khoản có role admin truy cập trang quản trị.
function requireAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role !== "admin") {
        return res.redirect("/login")
    }

    next()
}

// Biến trong res.locals có thể dùng trực tiếp ở mọi file EJS.
function useSession(req, res, next) {
    // Lấy người dùng từ session, nếu chưa đăng nhập thì nhận null.
    res.locals.user = req.session.user || null

    // Các hàm hỗ trợ định dạng dữ liệu trên giao diện.
    res.locals.formatCurrency = (value) => Number(value || 0).toLocaleString("vi-VN") + "đ"
    res.locals.formatDate = (value) => {
        if (!value) return ""
        return new Date(value).toLocaleDateString("vi-VN")
    }

    // Link http/https được dùng trực tiếp, tên file cũ được lấy từ public/images.
    res.locals.getCarImage = (image) => {
        if (!image) return "/images/Banner.png"
        if (image.startsWith("http://") || image.startsWith("https://")) return image
        return "/images/" + image
    }

    next()
}

module.exports = {
    requireLogin,
    requireAdmin,
    useSession
}
