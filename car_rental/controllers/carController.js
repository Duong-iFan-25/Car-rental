// controllers/carController.js
const carModel = require("../models/carModel");

// 1. Xử lý hiển thị danh sách xe + Tìm kiếm nâng cao
async function index(req, res) {
    try {
        let queryCondition = {};
        
        // Lấy từ khóa tìm kiếm từ ô nhập liệu (Query String: ?search=Toyota)
        if (req.query.search) {
            // Sử dụng toán tử $regex tìm kiếm chuỗi không phân biệt hoa thường (Database.pdf - Page 18)
            queryCondition.name = { $regex: req.query.search, $options: "i" };
        }

        // Gọi Model để tìm xe theo điều kiện, sắp xếp theo giá tăng dần (Database.pdf - Page 20)
        const cars = await carModel.findCars(queryCondition);

        // Render giao diện car-list.ejs và truyền mảng dữ liệu xe sang
        res.render("car-list", { 
            cars: cars, 
            searchKeyword: req.query.search || "" 
        });
    } catch (error) {
        res.status(500).send("Lỗi hệ thống khi tải danh sách xe");
    }
}

// 2. Xử lý hiển thị chi tiết 1 con xe
async function show(req, res) {
    try {
        const carId = req.params.id; // Lấy ID xe từ URL động (ExpressJS.pdf)
        const car = await carModel.getCarById(carId);

        if (!car) {
            return res.status(404).send("Không tìm thấy thông tin xe này!");
        }

        // Render trang chi tiết
        res.render("car-detail", { car: car });
    } catch (error) {
        res.status(500).send("Lỗi hệ thống khi tải chi tiết xe");
    }
}

module.exports = { index, show };