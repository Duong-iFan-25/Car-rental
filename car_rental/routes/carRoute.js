// routes/carRoute.js
const express = require("express");
const router = express.Router();
const carController = require("../controllers/carController");

// URL: /cars -> Trang danh sách xe (Có hỗ trợ tìm kiếm, lọc)
router.get("/", carController.index);

// URL: /cars/:id -> Trang chi tiết của 1 con xe cụ thể
router.get("/:id", carController.show);

module.exports = router;