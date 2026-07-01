// controllers/carController.js
const carModel = require("../models/carModel");

// (Hàm index giữ nguyên như hôm trước, bổ sung truyền thông tin session sang giao diện)
async function index(req, res) {
    try {
        let queryCondition = {};
        if (req.query.search) {
            queryCondition.name = { $regex: req.query.search, $options: "i" };
        }
        const cars = await carModel.findCars(queryCondition);
        
        // Truyền thêm user đang đăng nhập (nếu có) sang ejs hiển thị lời chào
        res.render("car-list", { 
            cars: cars, 
            searchKeyword: req.query.search || "",
            user: req.session.currentUser || null 
        });
    } catch (error) {
        res.status(500).send("Lỗi tải danh sách xe");
    }
}

async function show(req, res) {
    try {
        const car = await carModel.getCarById(req.params.id);
        if (!car) return res.status(404).send("Không tìm thấy xe");

        res.render("car-detail", { 
            car: car,
            user: req.session.currentUser || null
        });
    } catch (error) {
        res.status(500).send("Lỗi tải chi tiết xe");
    }
}

// --- TÍNH NĂNG MỚI: XỬ LÝ ĐẶT XE ---
async function bookCar(req, res) {
    // 1. Kiểm tra xem user đã đăng nhập chưa, nếu chưa bắt đi login
    if (!req.session.currentUser) {
        return res.redirect("/auth/login");
    }

    const carId = req.params.id;
    const { startDate, endDate } = req.body; // Lấy từ form đặt xe
    const car = await carModel.getCarById(carId);

    // Tính toán tổng tiền sơ bộ (ví dụ mặc định tính bằng giá 1 ngày cho đơn giản)
    const totalPrice = car.pricePerDay; 

    // 2. Tạo bản ghi đặt xe mới
    await carModel.createBooking({
        userId: req.session.currentUser.id,
        carId: carId,
        carName: car.name,
        startDate: startDate,
        endDate: endDate,
        totalPrice: totalPrice
    });

    // 3. Đặt thành công thì chuyển hướng đến trang danh sách đơn đặt xe cá nhân
    res.redirect("/cars/my-bookings");
}

// --- TÍNH NĂNG MỚI: XEM LỊCH SỬ ĐẶT XE CỦA TÔI ---
async function myBookings(req, res) {
    if (!req.session.currentUser) {
        return res.redirect("/auth/login");
    }
    
    const bookings = await carModel.getBookingsByUser(req.session.currentUser.id);
    res.render("my-bookings", { 
        bookings: bookings,
        user: req.session.currentUser 
    });
}

module.exports = { index, show, bookCar, myBookings };