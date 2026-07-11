const bookingModel = require("../models/bookingModel")
const carModel = require("../models/carModel")

// Tính số ngày thuê dựa vào ngày bắt đầu và ngày kết thúc.
function countDays(start_date, end_date) {
    const start = new Date(start_date)
    const end = new Date(end_date)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 1
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
        // Tổng tiền bằng số ngày thuê nhân với giá thuê một ngày.
        const total_price = countDays(start_date, end_date) * car.price_per_day

        // id người dùng được lấy từ session đăng nhập.
        await bookingModel.createBooking(
            req.session.user.id,
            car_id,
            start_date,
            end_date,
            total_price,
            note
        )

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

module.exports = {
    store,
    myBookings
}
