const express = require("express")
const carController = require("../controllers/carController")

const router = express.Router()

// Vì server gắn route này tại /cars nên đường dẫn đầy đủ là /cars.
router.get("/", carController.index)

// :id là tham số động, ví dụ /cars/3.
router.get("/:id", carController.show)

module.exports = router
