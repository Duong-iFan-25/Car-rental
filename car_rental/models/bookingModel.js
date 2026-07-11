const db = require("../config/db")

// Thêm một đơn thuê xe vào bảng bookings.
async function createBooking(user_id, car_id, start_date, end_date, total_price, note) {
    await db.query(
        `INSERT INTO bookings(user_id, car_id, start_date, end_date, total_price, note)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, car_id, start_date, end_date, total_price, note]
    )
}

// Lấy các đơn của một người dùng và nối bảng cars để lấy tên xe.
async function getBookingsByUser(user_id) {
    const [bookings] = await db.query(
        `SELECT bookings.*, cars.name AS car_name
         FROM bookings
         LEFT JOIN cars ON bookings.car_id = cars.id
         WHERE bookings.user_id = ?
         ORDER BY bookings.id DESC`,
        [user_id]
    )
    return bookings
}

module.exports = {
    createBooking,
    getBookingsByUser
}
