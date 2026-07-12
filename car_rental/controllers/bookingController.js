const bookingModel = require("../models/bookingModel")
const carModel = require("../models/carModel")

// Đổi ngày hiện tại thành chuỗi YYYY-MM-DD để so sánh với dữ liệu input date.
function getTodayString() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

// Kiểm tra chuỗi có đúng là một ngày hợp lệ theo định dạng YYYY-MM-DD.
function isValidDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

    const [year, month, day] = value.split("-").map(Number)
    const date = new Date(year, month - 1, day)
    return date.getFullYear() === year
        && date.getMonth() === month - 1
        && date.getDate() === day
}

// Hiển thị lỗi ngay trên trang chi tiết để người dùng chọn lại ngày.
function showBookingError(res, car, message) {
    return res.render("car-detail", { car, error: message })
}

// Tạo một đơn đặt xe mới.
async function store(req, res) {
    try {
        // carId được lấy từ đường dẫn /bookings/create/:carId.
        const car_id = req.params.carId
        const car = await carModel.getCarById(car_id)

        if (!car) {
            return res.send("Không tìm thấy xe")
        }

        const start_date = req.body.start_date
        const end_date = req.body.end_date
        const note = req.body.note

        if (!start_date || !end_date) {
            return showBookingError(res, car, "Vui lòng chọn đầy đủ ngày thuê và ngày trả xe")
        }

        if (!isValidDate(start_date) || !isValidDate(end_date)) {
            return showBookingError(res, car, "Ngày thuê hoặc ngày trả xe không hợp lệ")
        }

        if (start_date < getTodayString()) {
            return showBookingError(res, car, "Ngày thuê không được nằm trong quá khứ")
        }

        if (end_date < start_date) {
            return showBookingError(res, car, "Ngày trả xe không được trước ngày thuê xe")
        }

        // id người dùng được lấy từ session đăng nhập.
        const result = await bookingModel.createBooking(
            req.session.user.id,
            car_id,
            start_date,
            end_date,
            note
        )

        if (!result.success) {
            if (result.reason === "car_conflict") {
                return showBookingError(res, car, "Xe đã có lịch thuê trong khoảng thời gian này")
            }

            if (result.reason === "user_conflict") {
                return showBookingError(res, car, "Bạn đã có đơn thuê trùng với khoảng thời gian này")
            }

            return showBookingError(res, car, "Không thể tạo đơn thuê xe")
        }

        res.redirect("/my-bookings")
    } catch (error) {
        console.log(error)
        res.send("Lỗi khi đặt xe")
    }
}

// Hiển thị các đơn của người dùng đang đăng nhập.
async function myBookings(req, res) {
    try {
        const bookings = await bookingModel.getBookingsByUser(req.session.user.id)
        res.render("my-bookings", { bookings })
    } catch (error) {
        console.log(error)
        res.send("Lỗi khi xem đơn đặt xe")
    }
}

// Hiển thị toàn bộ đơn thuê cho admin.
async function adminBookings(req, res) {
    try {
        const bookings = await bookingModel.getAllBookings()
        res.render("admin/bookings", {
            bookings: bookings,
            message: req.query.message || null,
            error: req.query.error || null
        })
    } catch (error) {
        console.log(error)
        res.send("Lỗi khi lấy danh sách đơn thuê")
    }
}

// Duyệt đơn thuê đang chờ.
async function approve(req, res) {
    try {
        const result = await bookingModel.approveBooking(req.params.id)

        if (!result.success) {
            return res.redirect("/admin/bookings?error=" + result.reason)
        }

        res.redirect("/admin/bookings?message=approved")
    } catch (error) {
        console.log(error)
        res.send("Lỗi khi duyệt đơn thuê")
    }
}

// Từ chối đơn thuê đang chờ.
async function reject(req, res) {
    try {
        const success = await bookingModel.rejectBooking(req.params.id)

        if (!success) {
            return res.redirect("/admin/bookings?error=reject")
        }

        res.redirect("/admin/bookings?message=rejected")
    } catch (error) {
        console.log(error)
        res.send("Lỗi khi từ chối đơn thuê")
    }
}

module.exports = {
    store,
    myBookings,
    adminBookings,
    approve,
    reject
}
