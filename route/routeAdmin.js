const express = require("express");
const routes = express.Router();
const adminController = require("../controller/adminController");
const userController = require("../controller/userController");

//render admin layout
routes.get(
  "/",
  adminController.adminValidator,
  adminController.renderAdminLayout
);

//xửa lý yêu cầu upload
routes.get(
  "/uploadRequests",
  adminController.adminValidator,
  adminController.renderUploadRequests
);

routes.post(
  "/uploadToCloud",
  adminController.adminValidator,
  adminController.uploadToCloud
);

routes.post(
  "/rejectUpload",
  adminController.adminValidator,
  adminController.rejectUpload
);

//thống kê
routes.get("/getStatistics", adminController.getStatistics);
//quản lí app
routes.get(
  "/appControl",
  adminController.adminValidator,
  adminController.renderAppControl
);

routes.post(
  "/appControl/upload",
  adminController.adminValidator,
  userController.upload,
  adminController.uploadByAdmin,
  adminController.uploadToCloud
);

routes.post(
  "/appControl/block",
  adminController.adminValidator,
  adminController.blockApp
);

routes.post(
  "/appControl/updateDetails",
  adminController.adminValidator,
  adminController.updateDetails
);

routes.post(
  "/appControl/updateImage",
  adminController.adminValidator,
  userController.uploadImage.single("image"),
  adminController.updateImage
);

routes.post(
  "/appControl/updateFile",
  adminController.adminValidator,
  userController.uploadFile.single("file"),
  adminController.updateFile
);

//quản lí người dùng
routes.get(
  "/userControl",
  adminController.adminValidator,
  adminController.renderUserControl
);

routes.post(
  "/userControl/edit",
  adminController.adminValidator,
  adminController.updateUser
);

routes.post(
  "/userControl/block",
  adminController.adminValidator,
  adminController.blockUser
);

//quản lí comment
routes.get(
  "/appControl/comments/:idApp",
  adminController.adminValidator,
  adminController.renderComments
);
routes.post(
  "/appControl/comments/delete",
  adminController.adminValidator,
  adminController.deleteComment
);

module.exports = routes;
