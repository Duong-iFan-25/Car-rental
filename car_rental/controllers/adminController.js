const carModel = require("../models/carModel");
const dashboardModel = require("../models/dashboardModel");

function getCarData(body) {
  return {
    name: String(body.name || "").trim(),
    brand: String(body.brand || "").trim(),
    car_type: String(body.car_type || "").trim(),
    seats: Number(body.seats),
    price_per_day: Number(body.price_per_day),
    image: String(body.image || "").trim(),
    description: String(body.description || "").trim(),
  };
}

function validateCar(car) {
  if (!car.name || !car.brand || !car.image) {
    return "Vui lòng nhập đầy đủ tên xe, hãng và link ảnh";
  }

  if (
    car.name.length > 100 ||
    car.brand.length > 100 ||
    car.image.length > 255
  ) {
    return "Tên xe, hãng hoặc link ảnh vượt quá độ dài cho phép";
  }

  if (!["Số tự động", "Số sàn"].includes(car.car_type)) {
    return "Loại xe không hợp lệ";
  }

  if (!Number.isInteger(car.seats) || car.seats <= 0 || car.seats > 100) {
    return "Số chỗ phải là số nguyên lớn hơn 0";
  }

  if (!Number.isFinite(car.price_per_day) || car.price_per_day <= 0) {
    return "Giá thuê phải là số lớn hơn 0";
  }

  if (!/^https?:\/\/\S+$/i.test(car.image)) {
    return "Link ảnh phải bắt đầu bằng http:// hoặc https://";
  }

  return null;
}

function showCarNotFound(res) {
  return res.status(404).render("error", {
    title: "Không tìm thấy xe",
    message: "Xe bạn đang thao tác không tồn tại.",
  });
}

async function index(req, res) {
  try {
    const statistics = await dashboardModel.getStatistics();
    res.render("admin/dashboard", {
      title: "Dashboard",
      statistics: statistics,
    });
  } catch (error) {
    console.log(error);
    res.send("Lỗi khi lấy số liệu thống kê");
  }
}

async function cars(req, res) {
  try {
    const cars = await carModel.getAllCars();
    res.render("admin/cars", {
      cars,
      error: req.query.error || null,
    });
  } catch (error) {
    console.log(error);
    res.send("Lỗi khi lấy danh sách xe");
  }
}

function create(req, res) {
  res.render("admin/car-form", {
    title: "Thêm xe",
    car: {},
    action: "/admin/cars/create",
    error: null,
  });
}

async function store(req, res) {
  try {
    const car = getCarData(req.body);
    const error = validateCar(car);

    if (error) {
      return res.status(400).render("admin/car-form", {
        title: "Thêm xe",
        car,
        action: "/admin/cars/create",
        error,
      });
    }

    await carModel.createCar(
      car.name,
      car.brand,
      car.car_type,
      car.seats,
      car.price_per_day,
      car.image,
      car.description,
    );

    res.redirect("/admin/cars");
  } catch (error) {
    console.log(error);
    res.send("Lỗi khi thêm xe");
  }
}

async function edit(req, res) {
  try {
    const car = await carModel.getCarById(req.params.id);

    if (!car) {
      return showCarNotFound(res);
    }

    res.render("admin/car-form", {
      title: "Sửa xe",
      car,
      action: "/admin/cars/" + req.params.id + "/edit",
      error: null,
    });
  } catch (error) {
    console.log(error);
    res.send("Lỗi khi sửa xe");
  }
}

async function update(req, res) {
  try {
    const oldCar = await carModel.getCarById(req.params.id);

    if (!oldCar) {
      return showCarNotFound(res);
    }

    const car = getCarData(req.body);
    const error = validateCar(car);

    if (error) {
      return res.status(400).render("admin/car-form", {
        title: "Sửa xe",
        car,
        action: "/admin/cars/" + req.params.id + "/edit",
        error,
      });
    }

    const updated = await carModel.updateCar(
      req.params.id,
      car.name,
      car.brand,
      car.car_type,
      car.seats,
      car.price_per_day,
      car.image,
      car.description,
    );

    if (!updated) {
      return showCarNotFound(res);
    }

    res.redirect("/admin/cars");
  } catch (error) {
    console.log(error);
    res.send("Lỗi khi cập nhật xe");
  }
}

async function destroy(req, res) {
  try {
    const result = await carModel.deleteCar(req.params.id);

    if (!result.success) {
      return res.redirect("/admin/cars?error=" + result.reason);
    }

    res.redirect("/admin/cars");
  } catch (error) {
    console.log(error);
    res.send("Lỗi khi xóa xe");
  }
}

module.exports = {
  index,
  cars,
  create,
  store,
  edit,
  update,
  destroy,
};
