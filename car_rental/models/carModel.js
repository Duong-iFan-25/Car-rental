const db = require("../config/db")
const bookingModel = require("./bookingModel")

// Đồng bộ đơn hết hạn và trạng thái hiện tại trước khi lấy dữ liệu xe.
async function syncCarStatuses() {
    await bookingModel.syncRentalStatuses()
}

// Lấy tất cả xe, xe thêm gần nhất được đưa lên trước.
async function getAllCars() {
    await syncCarStatuses()
    const [cars] = await db.query("SELECT * FROM cars ORDER BY id DESC")
    return cars
}

// Tìm xe theo tên hoặc hãng; dấu % cho phép khớp một phần từ khóa.
async function searchCars(keyword) {
    await syncCarStatuses()
    const [cars] = await db.query(
        "SELECT * FROM cars WHERE name LIKE ? OR brand LIKE ? ORDER BY id DESC",
        [`%${keyword}%`, `%${keyword}%`]
    )
    return cars
}

// Lấy một xe theo id, không có thì trả về null.
async function getCarById(id) {
    await syncCarStatuses()
    const [rows] = await db.query(
        "SELECT * FROM cars WHERE id = ?",
        [id]
    )
    return rows[0] || null
}

// Thêm xe mới. Mỗi dấu ? nhận một giá trị trong mảng phía dưới.
async function createCar(name, brand, car_type, seats, price_per_day, image, description) {
    const [result] = await db.query(
        `INSERT INTO cars(name, brand, car_type, seats, price_per_day, image, description, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'available')`,
        [name, brand, car_type, seats, price_per_day, image, description]
    )
    return result.insertId
}

// Cập nhật xe có id tương ứng.
async function updateCar(id, name, brand, car_type, seats, price_per_day, image, description) {
    const [result] = await db.query(
        `UPDATE cars
         SET name = ?, brand = ?, car_type = ?, seats = ?, price_per_day = ?, image = ?, description = ?
         WHERE id = ?`,
        [name, brand, car_type, seats, price_per_day, image, description, id]
    )
    return result.affectedRows > 0
}

// Khóa xe trước khi xóa để booking mới không thể xuất hiện giữa lúc kiểm tra.
async function deleteCar(id) {
    const connection = await db.getConnection()

    try {
        await connection.beginTransaction()

        const [cars] = await connection.query(
            "SELECT id FROM cars WHERE id = ? FOR UPDATE",
            [id]
        )
        if (cars.length === 0) {
            await connection.rollback()
            return { success: false, reason: "not-found" }
        }

        const [bookings] = await connection.query(
            "SELECT id FROM bookings WHERE car_id = ? LIMIT 1",
            [id]
        )
        if (bookings.length > 0) {
            await connection.rollback()
            return { success: false, reason: "has-bookings" }
        }

        await connection.query("DELETE FROM cars WHERE id = ?", [id])
        await connection.commit()
        return { success: true }
    } catch (error) {
        await connection.rollback()
        throw error
    } finally {
        connection.release()
    }
}

module.exports = {
    getAllCars,
    searchCars,
    getCarById,
    createCar,
    updateCar,
    deleteCar
}
