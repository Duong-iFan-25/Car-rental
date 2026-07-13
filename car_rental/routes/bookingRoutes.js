const express = require("express");
const bookingController = require("../controllers/bookingController");
const { requireLogin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create/:carId", requireLogin, bookingController.store);
router.get("/my-bookings", requireLogin, bookingController.myBookings);

module.exports = router;
