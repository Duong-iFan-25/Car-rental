const db = require("../config/db");

async function createUser(full_name, username, password, phone) {
  await db.query(
    "INSERT INTO users(full_name, username, password, phone, role) VALUES (?, ?, ?, ?, ?)",
    [full_name, username, password, phone, "user"],
  );
}

async function findByUsername(username) {
  const [users] = await db.query("SELECT * FROM users WHERE username = ?", [
    username,
  ]);

  return users[0] || null;
}

async function checkLogin(username, password) {
  const [users] = await db.query(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
  );

  return users[0] || null;
}

module.exports = {
  createUser,
  findByUsername,
  checkLogin,
};
