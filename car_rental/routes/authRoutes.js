const express = require("express")
const authController = require("../controllers/authController")

const router = express.Router()

// GET dùng để mở form, POST dùng để nhận dữ liệu form gửi lên.
router.get("/login", authController.showLogin)
router.post("/login", authController.login)
router.get("/register", authController.showRegister)
router.post("/register", authController.register)
router.get("/logout", authController.logout)

module.exports = router
