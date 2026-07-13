const db = require("../config/db");

async function stopTransaction(connection, reason) {
  await connection.rollback();
  return { success: false, reason: reason };
}

async function createBooking(user_id, car_id, start_date, end_date, note) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [cars] = await connection.query(
      "SELECT id, price_per_day FROM cars WHERE id = ? FOR UPDATE",
      [car_id],
    );
    if (cars.length === 0) {
      return await stopTransaction(connection, "car_not_found");
    }

    const [users] = await connection.query(
      "SELECT id FROM users WHERE id = ? FOR UPDATE",
      [user_id],
    );
    if (users.length === 0) {
      return await stopTransaction(connection, "user_not_found");
    }

    const [carConflicts] = await connection.query(
      `SELECT id FROM bookings
             WHERE car_id = ?
               AND status IN ('pending', 'approved')
               AND start_date <= ?
               AND end_date >= ?
             LIMIT 1`,
      [car_id, end_date, start_date],
    );
    if (carConflicts.length > 0) {
      return await stopTransaction(connection, "car_conflict");
    }

    const [userConflicts] = await connection.query(
      `SELECT id FROM bookings
             WHERE user_id = ?
               AND status IN ('pending', 'approved')
               AND start_date <= ?
               AND end_date >= ?
             LIMIT 1`,
      [user_id, end_date, start_date],
    );
    if (userConflicts.length > 0) {
      return await stopTransaction(connection, "user_conflict");
    }

    const [dayRows] = await connection.query(
      "SELECT GREATEST(DATEDIFF(?, ?), 1) AS rental_days",
      [end_date, start_date],
    );
    const total_price =
      Number(dayRows[0].rental_days) * Number(cars[0].price_per_day);

    await connection.query(
      `INSERT INTO bookings(user_id, car_id, start_date, end_date, total_price, note)
             VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, car_id, start_date, end_date, total_price, note],
    );

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function syncRentalStatuses() {
  await db.query(
    `UPDATE bookings
         SET status = 'completed'
         WHERE status = 'approved'
           AND end_date < CURDATE()`,
  );

  await db.query(
    `UPDATE cars
         SET status = 
         CASE
             WHEN EXISTS (
                 SELECT 1 FROM bookings
                 WHERE bookings.car_id = cars.id
                   AND bookings.status = 'approved'
                   AND CURDATE() BETWEEN bookings.start_date AND bookings.end_date
             ) THEN 'rented'
             ELSE 'available'
         END`,
  );
}

async function getBookingsByUser(user_id) {
  await syncRentalStatuses();
  const [bookings] = await db.query(
    `SELECT bookings.*, cars.name AS car_name
         FROM bookings
         LEFT JOIN cars ON bookings.car_id = cars.id
         WHERE bookings.user_id = ?
         ORDER BY bookings.id DESC`,
    [user_id],
  );
  return bookings;
}

async function getAllBookings() {
  await syncRentalStatuses();
  const [bookings] = await db.query(
    `SELECT bookings.*, users.full_name, users.username, users.phone,
                cars.name AS car_name
         FROM bookings
         LEFT JOIN users ON bookings.user_id = users.id
         LEFT JOIN cars ON bookings.car_id = cars.id
         ORDER BY bookings.id DESC`,
  );
  return bookings;
}

async function approveBooking(id) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [candidates] = await connection.query(
      "SELECT car_id, user_id FROM bookings WHERE id = ?",
      [id],
    );
    if (candidates.length === 0) {
      return await stopTransaction(connection, "not_found");
    }

    const candidate = candidates[0];
    const [cars] = await connection.query(
      "SELECT id FROM cars WHERE id = ? FOR UPDATE",
      [candidate.car_id],
    );
    const [users] = await connection.query(
      "SELECT id FROM users WHERE id = ? FOR UPDATE",
      [candidate.user_id],
    );
    if (cars.length === 0 || users.length === 0) {
      return await stopTransaction(connection, "invalid_booking");
    }

    const [bookings] = await connection.query(
      `SELECT id, user_id, car_id, start_date, end_date, status
             FROM bookings
             WHERE id = ?
             FOR UPDATE`,
      [id],
    );
    const booking = bookings[0];
    if (!booking || booking.status !== "pending") {
      return await stopTransaction(connection, "processed");
    }

    const [dateCheck] = await connection.query(
      "SELECT ? < CURDATE() AS expired",
      [booking.end_date],
    );
    if (dateCheck[0].expired) {
      return await stopTransaction(connection, "expired");
    }

    const [carConflicts] = await connection.query(
      `SELECT id FROM bookings
             WHERE id <> ?
               AND car_id = ?
               AND status = 'approved'
               AND start_date <= ?
               AND end_date >= ?
             LIMIT 1`,
      [id, booking.car_id, booking.end_date, booking.start_date],
    );
    const [userConflicts] = await connection.query(
      `SELECT id FROM bookings
             WHERE id <> ?
               AND user_id = ?
               AND status = 'approved'
               AND start_date <= ?
               AND end_date >= ?
             LIMIT 1`,
      [id, booking.user_id, booking.end_date, booking.start_date],
    );
    if (carConflicts.length > 0 || userConflicts.length > 0) {
      return await stopTransaction(connection, "schedule_conflict");
    }

    await connection.query(
      "UPDATE bookings SET status = 'approved' WHERE id = ?",
      [id],
    );
    await connection.query(
      `UPDATE cars
             SET status = CASE
                 WHEN EXISTS (
                     SELECT 1 FROM bookings
                     WHERE bookings.car_id = cars.id
                       AND bookings.status = 'approved'
                       AND CURDATE() BETWEEN bookings.start_date AND bookings.end_date
                 ) THEN 'rented'
                 ELSE 'available'
             END
             WHERE id = ?`,
      [booking.car_id],
    );

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function rejectBooking(id) {
  const [result] = await db.query(
    "UPDATE bookings SET status = 'rejected' WHERE id = ? AND status = 'pending'",
    [id],
  );
  return result.affectedRows > 0;
}

module.exports = {
  createBooking,
  syncRentalStatuses,
  getBookingsByUser,
  getAllBookings,
  approveBooking,
  rejectBooking,
};
