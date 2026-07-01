// models/carModel.js

const mockDatabase = [
    { id: "1", name: "Toyota Vios", brand: "Toyota", pricePerDay: 800000, type: "Tự động", image: "vios.jpg" },
    { id: "2", name: "Hyundai Accent", brand: "Hyundai", pricePerDay: 750000, type: "Số sàn", image: "accent.jpg" },
    { id: "3", name: "VinFast VF8", brand: "VinFast", pricePerDay: 1500000, type: "Điện", image: "vf8.jpg" }
];

// 1. Giả lập bảng Thành viên (Dùng để kiểm tra đăng nhập)
const mockUsers = [
    { id: "u1", username: "sinhvien", password: "123", fullName: "Nguyễn Văn A" }
];

// 2. Giả lập bảng Đơn đặt xe (Booking)
const mockBookings = [];

// --- CÁC HÀM XỬ LÝ CHO XE ---
async function findCars(condition) {
    if (condition.name) {
        const regex = new RegExp(condition.name.$regex, "i");
        return mockDatabase.filter(car => regex.test(car.name));
    }
    return mockDatabase;
}

async function getCarById(id) {
    return mockDatabase.find(car => car.id === id);
}

// --- CÁC HÀM XỬ LÝ CHO USER (Cookie-session.pdf) ---
async function checkLogin(username, password) {
    // Tìm user trùng khớp username và password
    return mockUsers.find(u => u.username === username && u.password === password);
}

// --- CÁC HÀM XỬ LÝ ĐẶT XE (Database.pdf - Create) ---
async function createBooking(bookingData) {
    const newBooking = {
        id: "b" + (mockBookings.length + 1),
        ...bookingData,
        status: "Chờ duyệt",
        createdAt: new Date()
    };
    mockBookings.push(newBooking);
    return newBooking;
}

async function getBookingsByUser(userId) {
    return mockBookings.filter(b => b.userId === userId);
}

module.exports = { 
    findCars, 
    getCarById, 
    checkLogin, 
    createBooking, 
    getBookingsByUser 
};