const db = require("../config/db");
const bookingModel = require("./bookingModel");

async function syncCarStatuses() {
  await bookingModel.syncRentalStatuses();
}

async function getAllCars() {
  await syncCarStatuses();
  const [cars] = await db.query("SELECT * FROM cars ORDER BY id DESC");
  return cars;
}

async function searchCars(keyword) {
  await syncCarStatuses();
  const [cars] = await db.query(
    "SELECT * FROM cars WHERE name LIKE ? OR brand LIKE ? ORDER BY id DESC",
    [`%${keyword}%`, `%${keyword}%`],
  );
  return cars;
}

async function getCarById(id) {
  await syncCarStatuses();
  const [rows] = await db.query("SELECT * FROM cars WHERE id = ?", [id]);
  return rows[0] || null;
}

async function createCar(
  name,
  brand,
  car_type,
  seats,
  price_per_day,
  image,
  description,
) {
  const [result] = await db.query(
    `INSERT INTO cars(name, brand, car_type, seats, price_per_day, image, description, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'available')`,
    [name, brand, car_type, seats, price_per_day, image, description],
  );
  return result.insertId;
}

async function updateCar(
  id,
  name,
  brand,
  car_type,
  seats,
  price_per_day,
  image,
  description,
) {
  const [result] = await db.query(
    `UPDATE cars
         SET name = ?, brand = ?, car_type = ?, seats = ?, price_per_day = ?, image = ?, description = ?
         WHERE id = ?`,
    [name, brand, car_type, seats, price_per_day, image, description, id],
  );
  return result.affectedRows > 0;
}

async function deleteCar(id) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [cars] = await connection.query(
      "SELECT id FROM cars WHERE id = ? FOR UPDATE",
      [id],
    );
    if (cars.length === 0) {
      await connection.rollback();
      return { success: false, reason: "not-found" };
    }

    const [bookings] = await connection.query(
      "SELECT id FROM bookings WHERE car_id = ? LIMIT 1",
      [id],
    );
    if (bookings.length > 0) {
      await connection.rollback();
      return { success: false, reason: "has-bookings" };
    }

    await connection.query("DELETE FROM cars WHERE id = ?", [id]);
    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getAllCars,
  searchCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
};
