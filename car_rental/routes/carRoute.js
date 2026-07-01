// routes/carRoute.js
const express = require("express");
const router = express.Router();
const carController = require("../controllers/carController");

router.get("/", carController.index);
router.get("/my-bookings", carController.myBookings); // Xem lịch sử đặt xe
router.get("/:id", carController.show);
router.post("/:id/book", carController.bookCar);       // Gửi đơn đặt xe công việc

module.exports = router;