const carModel = require("../models/carModel")
const dashboardModel = require("../models/dashboardModel")

// Hiển thị các số liệu tổng quan tại trang Dashboard admin.
async function index(req, res) {
    try {
        const statistics = await dashboardModel.getStatistics()
        res.render("admin/dashboard", {
            title: "Dashboard",
            statistics: statistics
        })
    } catch (error) {
        console.log(error)
        res.send("Lỗi khi lấy số liệu thống kê")
    }
}

// Lấy và hiển thị toàn bộ xe cho admin.
async function cars(req, res) {
    try {
        const cars = await carModel.getAllCars()
        res.render("admin/cars", { cars })
    } catch (error) {
        console.log(error)
        res.send("Lỗi khi lấy danh sách xe")
    }
}

// Hiển thị form thêm xe mới.
function create(req, res) {
    res.render("admin/car-form", {
        title: "Thêm xe",
        car: {},
        action: "/admin/cars/create"
    })
}

// Nhận dữ liệu form và thêm xe vào database.
async function store(req, res) {
    try {
        await carModel.createCar(
            req.body.name,
            req.body.brand,
            req.body.car_type,
            req.body.seats,
            req.body.price_per_day,
            req.body.image,
            req.body.description,
            req.body.status
        )

        res.redirect("/admin/cars")
    } catch (error) {
        console.log(error)
        res.send("Lỗi khi thêm xe")
    }
}

// Lấy xe theo id rồi hiển thị form sửa.
async function edit(req, res) {
    try {
        const car = await carModel.getCarById(req.params.id)
        res.render("admin/car-form", {
            title: "Sửa xe",
            car,
            action: "/admin/cars/" + req.params.id + "/edit"
        })
    } catch (error) {
        console.log(error)
        res.send("Lỗi khi sửa xe")
    }
}

// Cập nhật thông tin xe sau khi admin gửi form sửa.
async function update(req, res) {
    try {
        await carModel.updateCar(
            req.params.id,
            req.body.name,
            req.body.brand,
            req.body.car_type,
            req.body.seats,
            req.body.price_per_day,
            req.body.image,
            req.body.description,
            req.body.status
        )

        res.redirect("/admin/cars")
    } catch (error) {
        console.log(error)
        res.send("Lỗi khi cập nhật xe")
    }
}

// Xóa xe theo id nhận từ đường dẫn.
async function destroy(req, res) {
    try {
        await carModel.deleteCar(req.params.id)
        res.redirect("/admin/cars")
    } catch (error) {
        console.log(error)
        res.send("Lỗi khi xóa xe")
    }
}

module.exports = {
    index,
    cars,
    create,
    store,
    edit,
    update,
    destroy
}
