// models/carModel.js

// Giả lập Database chứa danh sách xe
const mockDatabase = [
    { id: "1", name: "Toyota Vios", brand: "Toyota", pricePerDay: 800000, type: "Tự động", image: "vios.jpg" },
    { id: "2", name: "Hyundai Accent", brand: "Hyundai", pricePerDay: 750000, type: "Số sàn", image: "accent.jpg" },
    { id: "3", name: "VinFast VF8", brand: "VinFast", pricePerDay: 1500000, type: "Điện", image: "vf8.jpg" }
];

// Hàm tìm kiếm xe (Áp dụng cơ chế bất đồng bộ như slide Database.pdf - Page 16)
async function findCars(condition) {
    if (condition.name) {
        const regex = new RegExp(condition.name.$regex, "i");
        return mockDatabase.filter(car => regex.test(car.name));
    }
    return mockDatabase; // Nếu không tìm kiếm, trả về hết
}

async function getCarById(id) {
    return mockDatabase.find(car => car.id === id);
}

module.exports = { findCars, getCarById };