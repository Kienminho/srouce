const user = require("../model/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
//đăng nhập
let renderLogin = (req, res) => {
  if (req.session.isLogin) {
    return res.redirect("/");
  } else if (req.session.role == "admin") {
    return res.redirect("/admin");
  }
  return res.render("login", { layout: false });
};

let handleLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    //tìm user trong database
    const User = await user.findOne({ username });
    console.log(User);
    if (!User || User === null) {
      return res.json({
        status: 300,
        message: "Người dùng không tồn tại, vui lòng đăng kí",
      });
    }

    if (User.status != 1) {
      return res.json({
        status: 300,
        message: "Tài khoản đã bị khóa do vi phạm chính sách",
      });
    }

    const match = await bcrypt.compare(password, User.password);
    console.log(match);
    if (match) {
      req.session.name = username;
      res.cookie("username", username);
      req.session.isLogin = true;
      let urlRedirect = "/";
      if (User.role === "admin") {
        urlRedirect = "/admin";
        req.session.role = "admin";
      }
      console.log(urlRedirect);
      return res.json({
        status: 200,
        urlRedirect: urlRedirect,
      });
    }
    return res.json({
      status: 301,
      message: "Tên đăng nhập hoặc mật khẩu sai",
    });
  } catch (error) {
    //xử lý lỗi ở đây
    console.error(error);
    return res.json({
      status: 404,
      message: "Có lỗi xảy ra, vui lòng thử lại",
    });
  }
};

//đăng kí
let renderRegister = (req, res) => {
  if (req.session.isLogin) {
    return res.redirect("/");
  }
  return res.render("register", { layout: false });
};

let handleVerify = (req, res) => {
  //lấy thống tin từ method post
  let { username, email, password } = req.body;
  return sendEmail(res, email);
};

//xửa lý quên mật khẩu
let renderForgotPassword = (req, res) => {
  res.render("forgot-password", { layout: false });
};

//nhận email của người dùng để xử lý lấy lại mật khẩu
let receiveRequest = async (req, res) => {
  const email = req.body.email;
  const userForgotPassword = await user.findOne({ email: email });
  if (!userForgotPassword) {
    return res.json({
      status: 301,
      message: "Email không tồn tại trên hệ thống",
    });
  } else {
    return sendEmail(res, email);
  }
};

//thay đổi password
let changePassword = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const salt = await bcrypt.genSalt(10);

  // Mã hóa password kết hợp với salt
  const hash = await bcrypt.hash(password, salt);
  const findUser = await user.findOne({ email });
  await findUser.updateOne({ password: hash });
  res.json({ status: 200, message: "Thay đổi mật khẩu thành công" });
};

let handleRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const createdAt = Date.now();
    const findUser = await user.findOne({ username: username });
    if (!findUser) {
      // Tạo một salt ngẫu nhiên
      const salt = await bcrypt.genSalt(10);

      // Mã hóa password kết hợp với salt
      const hash = await bcrypt.hash(password, salt);

      const User = await user.create({
        username,
        email,
        password: hash,
        createdAt,
      });
      console.log("success");
      res.json({
        status: 200,
        urlRedirect: "/auth/login",
        message: "Đăng kí thành công, bạn sẽ được chuyển đến trang đăng nhập",
      });
    } else {
      res.json({
        status: 400,
        message: "Tên đăng nhập đã tồn tại, vui lòng sử dụng tên khác",
      });
    }
  } catch (err) {
    console.log(err);
  }
};

//đăng xuất
let handleLogout = (req, res) => {
  req.session.destroy();
  res.cookie("username", "", { maxAge: 0 }); // xóa cookie "username"
  res.redirect("/");
};

let authenticateGoogleCallback = async (req, res) => {
  const username = req.user.name.givenName;
  const email = req.user.emails[0].value;
  const createdAt = Date.now();
  //tạo mật khẩu mặc định cho người dùng đăng nhập google
  const password = "social_login_password";
  const salt = await bcrypt.genSalt(10);

  // Mã hóa password kết hợp với salt
  const hash = await bcrypt.hash(password, salt);
  const User = await user.findOne({ username: username });
  console.log(User);
  if (!User) {
    await user.create({ username, email, password: hash, createdAt });
    console.log("tạo thành công user");
  }
  req.session.name = username;
  res.redirect("/");
};

let authenticateFacebookCallback = async (req, res) => {
  const username = req.user.displayName;
  const email = "facebook@gmail.com";
  const password = "social_login_password";
  const createdAt = Date.now();
  const salt = await bcrypt.genSalt(10);

  // Mã hóa password kết hợp với salt
  const hash = await bcrypt.hash(password, salt);
  const User = await user.findOne({ username: username });
  console.log(User);
  if (!User) {
    await user.create({ username, email, password: hash, createdAt });
  }
  req.session.name = username;
  res.redirect("/");
};

function sendEmail(res, email) {
  // Tạo một transport để gửi email
  const otp = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  const html = `<h1>Chào bạn!</h1>
<p>Cảm ơn bạn đã đăng ký sử dụng dịch vụ của chúng tôi.</p>
<p> Mã OTP của bạn sẽ là: ${otp}`;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "Hopkien1609@gmail.com", // Email người gửi
      pass: "vptxiuwznddhfzdl", // Mật khẩu email người gửi
    },
  });
  // Cấu hình nội dung email
  const mailOptions = {
    from: "Hopkien1609@gmail.com", // Email người gửi
    to: email, // Email người nhận
    subject: "Xác thực người dùng", // Tiêu đề email
    html: html, // Nội dung email
  };
  // Gửi email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log(191);
      res.json({ status: 200, code: otp });
    }
  });
}

module.exports = {
  renderLogin: renderLogin,
  handleLogin: handleLogin,
  renderRegister: renderRegister,
  handleVerify: handleVerify,
  renderForgotPassword: renderForgotPassword,
  receiveRequest: receiveRequest,
  changePassword: changePassword,
  handleRegister: handleRegister,
  handleLogout: handleLogout,
  authenticateGoogleCallback: authenticateGoogleCallback,
  authenticateFacebookCallback: authenticateFacebookCallback,
};
