const db = require("../config/db");

async function getStatistics() {
  const [cars] = await db.query("SELECT COUNT(*) AS total FROM cars");
  const [bookings] = await db.query("SELECT COUNT(*) AS total FROM bookings");
  const [pendingBookings] = await db.query(
    "SELECT COUNT(*) AS total FROM bookings WHERE status = ?",
    ["pending"],
  );
  const [users] = await db.query(
    "SELECT COUNT(*) AS total FROM users WHERE role = ?",
    ["user"],
  );

  return {
    totalCars: cars[0].total,
    totalBookings: bookings[0].total,
    pendingBookings: pendingBookings[0].total,
    totalUsers: users[0].total,
  };
}

module.exports = {
  getStatistics,
};
