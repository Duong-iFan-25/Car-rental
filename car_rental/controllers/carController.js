const carModel = require("../models/carModel")

// Hiển thị danh sách xe hoặc kết quả tìm kiếm.
async function index(req, res) {
    try {
        // Lấy từ khóa trên URL, ví dụ: /cars?search=Toyota.
        const keyword = req.query.search || ""
        let cars = []

        if (keyword) {
            cars = await carModel.searchCars(keyword)
        } else {
            cars = await carModel.getAllCars()
        }

        res.render("cars", { cars, search: keyword })
    } catch (error) {
        console.log(error)
        res.send("Lỗi khi lấy danh sách xe")
    }
}

// Hiển thị chi tiết một xe theo id trên URL.
async function show(req, res) {
    try {
        // Với URL /cars/3 thì req.params.id có giá trị là 3.
        const id = req.params.id
        const car = await carModel.getCarById(id)

        if (!car) {
            return res.send("Không tìm thấy xe")
        }

        res.render("car-detail", { car })
    } catch (error) {
        console.log(error)
        res.send("Lỗi khi xem chi tiết xe")
    }
}

module.exports = {
    index,
    show
}
