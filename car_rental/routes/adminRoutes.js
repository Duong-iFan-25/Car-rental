const express = require("express");
const adminController = require("../controllers/adminController");
const bookingController = require("../controllers/bookingController");
const { requireAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", requireAdmin, adminController.index);
router.get("/cars", requireAdmin, adminController.cars);
router.get("/cars/create", requireAdmin, adminController.create);
router.post("/cars/create", requireAdmin, adminController.store);
router.get("/cars/:id/edit", requireAdmin, adminController.edit);
router.post("/cars/:id/edit", requireAdmin, adminController.update);
router.post("/cars/:id/delete", requireAdmin, adminController.destroy);

router.get("/bookings", requireAdmin, bookingController.adminBookings);
router.post("/bookings/:id/approve", requireAdmin, bookingController.approve);
router.post("/bookings/:id/reject", requireAdmin, bookingController.reject);

module.exports = router;
