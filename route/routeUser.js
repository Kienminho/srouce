const express = require("express");
const routes = express.Router();
const userController = require("../controller/userController");
const homeController = require("../controller/homeController");
//render wishlist theo user
routes.get(
  "/wish-list",
  homeController.requireLogin,
  userController.renderWishList
);

//thêm apps vào wish list
routes.get(
  `/add-wish-list/:idAppCurrent`,
  homeController.requireLogin,
  userController.addWishList
);

routes.delete(`/delete-wish-list/:id`, userController.deleteWishList);
//upload của user
routes.post("/upload", userController.upload, userController.sendUploadRequest);

//render wishlist theo user
routes.get(
  "/my-downloads",
  homeController.requireLogin,
  userController.renderMyDownloads
);
//xử lý phần tăng download
routes.post(
  "/increase-download-count",
  homeController.requireLogin,
  userController.increaseDownload
);



module.exports = routes;
