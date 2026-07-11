const express = require("express")
const bookingController = require("../controllers/bookingController")
const { requireLogin } = require("../middlewares/authMiddleware")

const router = express.Router()

// requireLogin chạy trước controller để bảo vệ chức năng đặt xe.
router.post("/create/:carId", requireLogin, bookingController.store)
router.get("/my-bookings", requireLogin, bookingController.myBookings)

module.exports = router
