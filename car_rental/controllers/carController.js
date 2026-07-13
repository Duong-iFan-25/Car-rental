const carModel = require("../models/carModel");

async function index(req, res) {
  try {
    const keyword = String(req.query.search || "").trim();
    let cars = [];

    if (keyword) {
      cars = await carModel.searchCars(keyword);
    } else {
      cars = await carModel.getAllCars();
    }

    res.render("cars", { cars, search: keyword });
  } catch (error) {
    console.log(error);
    res.send("Lỗi khi lấy danh sách xe");
  }
}

async function show(req, res) {
  try {
    const id = req.params.id;
    const car = await carModel.getCarById(id);

    if (!car) {
      return res.send("Không tìm thấy xe");
    }

    res.render("car-detail", { car, error: null });
  } catch (error) {
    console.log(error);
    res.send("Lỗi khi xem chi tiết xe");
  }
}

module.exports = {
  index,
  show,
};
