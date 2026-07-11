const express = require("express")
const homeController = require("../controllers/homeController")

const router = express.Router()

// GET / sẽ gọi hàm index trong homeController.
router.get("/", homeController.index)

module.exports = router
