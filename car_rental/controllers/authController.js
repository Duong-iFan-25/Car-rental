const userModel = require("../models/userModel");

function showLogin(req, res) {
  const message = req.query.registered ? "Đăng ký thành công." : null;
  res.render("login", { error: null, message: message });
}

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

    const user = await userModel.checkLogin(username, password);

    if (!user) {
      return res.render("login", {
        error: "Sai tên tài khoản hoặc mật khẩu",
        message: null,
      });
    }

    req.session.user = {
      id: user.id,
      full_name: user.full_name,
      username: user.username,
      role: user.role,
    };

    if (user.role === "admin") {
      return res.redirect("/admin");
    }

    res.redirect("/cars");
  } catch (error) {
    console.log(error);
    res.send("Lỗi đăng nhập");
  }
}

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

async function register(req, res) {
  try {
    const full_name = String(req.body.full_name || "").trim();
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "");
    const confirm_password = String(req.body.confirm_password || "");
    const phone = String(req.body.phone || "").trim();

    const formData = {
      full_name: full_name,
      username: username,
      phone: phone,
    };

    if (!full_name || !username || !password || !confirm_password) {
      return res.render("register", {
        error: "Vui lòng nhập đầy đủ thông tin",
        formData: formData,
      });
    }

    if (full_name.length > 100 || username.length > 100 || phone.length > 20) {
      return res.render("register", {
        error: "Thông tin đăng ký vượt quá độ dài cho phép",
        formData: formData,
      });
    }

    if (password !== confirm_password) {
      return res.render("register", {
        error: "Mật khẩu nhập lại không khớp",
        formData: formData,
      });
    }

    const oldUser = await userModel.findByUsername(username);

    if (oldUser) {
      return res.render("register", {
        error: "Tên tài khoản đã tồn tại",
        formData: formData,
      });
    }

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
