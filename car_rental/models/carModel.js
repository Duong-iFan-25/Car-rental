const db = require("../config/db")

// Lấy tất cả xe, xe thêm gần nhất được đưa lên trước.
async function getAllCars() {
    const [cars] = await db.query("SELECT * FROM cars ORDER BY id DESC")
    return cars
}

// Tìm xe theo tên hoặc hãng; dấu % cho phép khớp một phần từ khóa.
async function searchCars(keyword) {
    const [cars] = await db.query(
        "SELECT * FROM cars WHERE name LIKE ? OR brand LIKE ? ORDER BY id DESC",
        [`%${keyword}%`, `%${keyword}%`]
    )
    return cars
}

// Lấy một xe theo id, không có thì trả về null.
async function getCarById(id) {
    const [rows] = await db.query(
        "SELECT * FROM cars WHERE id = ?",
        [id]
    )
    return rows[0] || null
}

// Thêm xe mới. Mỗi dấu ? nhận một giá trị trong mảng phía dưới.
async function createCar(name, brand, car_type, seats, price_per_day, image, description, status) {
    await db.query(
        `INSERT INTO cars(name, brand, car_type, seats, price_per_day, image, description, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, brand, car_type, seats, price_per_day, image, description, status]
    )
}

// Cập nhật xe có id tương ứng.
async function updateCar(id, name, brand, car_type, seats, price_per_day, image, description, status) {
    await db.query(
        `UPDATE cars
         SET name = ?, brand = ?, car_type = ?, seats = ?, price_per_day = ?, image = ?, description = ?, status = ?
         WHERE id = ?`,
        [name, brand, car_type, seats, price_per_day, image, description, status, id]
    )
}

// Xóa xe theo id.
async function deleteCar(id) {
    await db.query("DELETE FROM cars WHERE id = ?", [id])
}

module.exports = {
    getAllCars,
    searchCars,
    getCarById,
    createCar,
    updateCar,
    deleteCar
}
