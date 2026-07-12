const userModel = require("../models/userModel");

// Hiển thị form đăng nhập.
function showLogin(req, res) {
  // req.query.registered xuất hiện sau khi đăng ký thành công.
  const message = req.query.registered ? "Đăng ký thành công." : null;
  res.render("login", { error: null, message: message });
}

// Nhận username và mật khẩu từ form đăng nhập.
async function login(req, res) {
  try {
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "");

    if (!username || !password) {
      return res.render("login", {
        error: "Vui lòng nhập tên tài khoản và mật khẩu",
        message: null,
      });
    }

    // Nhờ model kiểm tra tài khoản trong bảng users.
    const user = await userModel.checkLogin(username, password);

    if (!user) {
      return res.render("login", {
        error: "Sai tên tài khoản hoặc mật khẩu",
        message: null,
      });
    }

    // Lưu thông tin cần thiết vào session để ghi nhớ đăng nhập.
    req.session.user = {
      id: user.id,
      full_name: user.full_name,
      username: user.username,
      role: user.role,
    };

    // Admin vào Dashboard, người dùng thường vào danh sách xe.
    if (user.role === "admin") {
      return res.redirect("/admin");
    }

    res.redirect("/cars");
  } catch (error) {
    console.log(error);
    res.send("Lỗi đăng nhập");
  }
}

// Hiển thị form đăng ký với dữ liệu ban đầu là rỗng.
function showRegister(req, res) {
  res.render("register", {
    error: null,
    formData: {
      full_name: "",
      username: "",
      phone: "",
    },
  });
}

// Nhận và xử lý dữ liệu do form đăng ký gửi lên.
async function register(req, res) {
  try {
    const full_name = String(req.body.full_name || "").trim();
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "");
    const confirm_password = String(req.body.confirm_password || "");
    const phone = String(req.body.phone || "").trim();

    // Giữ lại dữ liệu để người dùng không phải nhập lại khi có lỗi.
    const formData = {
      full_name: full_name,
      username: username,
      phone: phone,
    };

    // Kiểm tra các trường bắt buộc.
    if (!full_name || !username || !password) {
      return res.render("register", {
        error: "Vui lòng nhập đầy đủ thông tin",
        formData: formData,
      });
    }

    // Kiểm tra độ dài trước để tránh lỗi vượt giới hạn cột trong database.
    if (full_name.length > 100 || username.length > 100 || phone.length > 20) {
      return res.render("register", {
        error: "Thông tin đăng ký vượt quá độ dài cho phép",
        formData: formData,
      });
    }

    // Hai lần nhập mật khẩu phải giống nhau.
    if (password !== confirm_password) {
      return res.render("register", {
        error: "Mật khẩu nhập lại không khớp",
        formData: formData,
      });
    }

    // Không cho phép hai tài khoản dùng chung một username.
    const oldUser = await userModel.findByUsername(username);

    if (oldUser) {
      return res.render("register", {
        error: "Tên tài khoản đã tồn tại",
        formData: formData,
      });
    }

    // Dữ liệu hợp lệ thì thêm người dùng và chuyển sang đăng nhập.
    await userModel.createUser(full_name, username, password, phone);
    res.redirect("/login?registered=1");
  } catch (error) {
    console.log(error);
    res.render("register", {
      error: "Không thể đăng ký tài khoản",
      formData: req.body,
    });
  }
}

// Xóa session hiện tại để đăng xuất.
function logout(req, res) {
  req.session.destroy(() => {
    res.redirect("/login");
  });
}

module.exports = {
  showLogin,
  login,
  showRegister,
  register,
  logout,
};
