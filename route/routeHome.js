const express = require("express");
const routes = express.Router();
const homeController = require("../controller/homeController");

//khởi chạy web
routes.get("/", homeController.renderHome);
//các trường ở navigation bar
routes.get("/about", homeController.renderAbout);
routes.get("/contact", homeController.renderContact);
routes.get("/apps", homeController.renderApps);
routes.get("/games", homeController.renderGames);
routes.get("/books", homeController.renderBooks);
//gửi data về client, API
routes.get("/data", homeController.handleData);

//chi tiết ứng dụng
routes.get(`/app/:_id`, homeController.detailApp);

routes.get(
  `/app/comments/:_id`,
  homeController.requireLogin,
  homeController.handelComment
);

routes.get("/app-search", homeController.handelSearch);
routes.get("/result", homeController.resultForSearch);

//test
//routes.get("/test", homeController.test);
module.exports = routes;
