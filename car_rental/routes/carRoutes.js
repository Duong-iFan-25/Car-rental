const express = require("express");
const carController = require("../controllers/carController");

const router = express.Router();

router.get("/", carController.index);

router.get("/:id", carController.show);

module.exports = router;
