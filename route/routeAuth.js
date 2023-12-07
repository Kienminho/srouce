const express = require("express");
const routes = express.Router();
const authController = require("../controller/authController");
const passport = require("../config/passport");

//đăng nhập
routes.get("/login", authController.renderLogin);
routes.post("/login", authController.handleLogin);

//đăng kí
routes.get("/register", authController.renderRegister);
routes.post("/verify-OTP", authController.handleVerify);
routes.post("/register", authController.handleRegister);

//đăng xuất
routes.get("/logout", authController.handleLogout);

//quên mật khẩu
routes.get("/forgot-password", authController.renderForgotPassword);

//nhân yêu cầu lấy mật khẩu
routes.post("/receive-request", authController.receiveRequest);

//đổi mật khẩu
routes.post("/change-password", authController.changePassword);

//đăng nhập bằng google
routes.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

routes.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  authController.authenticateGoogleCallback
);

//login facebook
routes.get("/facebook", passport.authenticate("facebook"));

//callback facebook
routes.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/" }),
  authController.authenticateFacebookCallback
);

module.exports = routes;
