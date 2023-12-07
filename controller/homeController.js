const App = require("../model/Apps");
const Comment = require("../model/Comments");
const Static = require("../model/statistical");

//mảng nhận kết quả tìm kiếm
let result = [];
//thời gian
const moment = require("moment");
let renderHome = (req, res) => {
  //tăng số lượng truy cập web để lấy thống kê
  increaseDownloadCount();

  if (req.session.role === "admin") {
    return res.redirect("/admin");
  }
  return res.render("home", { username: req.session.name });
};

//Api gửi dữ liệu về server
let handleData = async (req, res, next) => {
  try {
    const data = await App.find({ status: 1 }).exec();
    const appByCategory = data.reduce((result, product) => {
      const category = product.category;
      if (!result[category]) {
        result[category] = [];
      }
      result[category].push(product);
      return result;
    }, {});
    res.json({ status: 200, data: appByCategory });
  } catch (err) {
    console.log(err);
  }
  next();
};

//các trường ở navigation bar
//render giao diện about
let renderAbout = (req, res) => {
  res.render("about", { username: req.session.name });
};
// render giao diện contact
let renderContact = (req, res) => {
  res.render("contact", { username: req.session.name });
};

// render giao diện app
let renderApps = async (req, res) => {
  // Lấy tất cả ứng dụng trong category "A"
  const apps = await App.find({ category: "A", status: 1 });
  return filter(res, req, apps, "applications");
};

//render giao diện games
let renderGames = async (req, res) => {
  const games = await App.find({ category: "G", status: 1 });
  return filter(res, req, games, "games");
};

//render giao diện book
let renderBooks = async (req, res) => {
  const books = await App.find({ category: "B", status: 1 });
  return filter(res, req, books, "books");
};

//chi tiết apps
let detailApp = async (req, res) => {
  const id = req.params._id;
  await App.findById(id)
    .then((app) => {
      App.find({ category: { $in: app.category }, _id: { $ne: app._id } })
        .limit(6)
        .then((results) => {
          Comment.find({ idApp: id }).then((comments) => {
            return res.render("detailApp", {
              app: app,
              related: results,
              comments: comments,
              username: req.session.name,
            });
          });
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

//lấy tất cả ác comment theo app
let getAllComments = (req, res, next) => {
  const id = req.params._id;
  Comment.find({ idApp: id })
    .then((data) => {
      console.log(data);
      next();
    })
    .catch((err) => {
      console.log(err);
    });
};

let requireLogin = (req, res, next) => {
  if (req.session && req.session.name) {
    // Cho phép người dùng truy cập các chức năng yêu cầu đăng nhập
    next();
  } else {
    //Trả về json báo lỗi
    return res.json({
      status: 402,
      message: "Vui lòng đăng nhập để thực hiện.",
    });
  }
};

//tiếp nhận comment
let handelComment = (req, res) => {
  const { comment, rating } = req.query;
  const idAppCurrent = req.params._id;
  if (comment === "") {
    return res.json({
      status: 303,
      message: "Vui lòng nhập đánh giá của bạn.",
    });
  }
  const newComment = {
    userName: req.session.name,
    idApp: idAppCurrent,
    date_time: moment(Date.now()).format("DD/MM/YYYY"),
    ratings: rating,
    content: comment,
  };
  //thêm comment vào db
  Comment.create(newComment)
    .then((comment) => {
      console.log("done");
      return res.json({ status: 200, message: "Cảm ơn bạn đã đánh giá" });
    })
    .catch((error) => {
      console.log(error);
    });
};

let handelSearch = async (req, res) => {
  const key = req.query.key;
  const resultForSearch = await App.find({
    nameApp: { $regex: key, $options: "i" },
    status: 1,
  });
  result = resultForSearch;
  return res.render("searchApp", {
    key: key,
    resultForSearch: resultForSearch,
    username: req.session.name,
  });
};

let resultForSearch = async (req, res) => {
  return res.json({ status: 200, data: result });
};

function filter(res, req, array, namePage) {
  // Sắp xếp các ứng dụng theo thứ tự giảm dần của nDownload và chỉ lấy 6 ứng dụng đầu tiên
  const topDownloads = array
    .sort((a, b) => b.nDownload - a.nDownload)
    .slice(0, 6);

  // Sắp xếp các ứng dụng theo thứ tự giảm dần của rating và chỉ lấy 6 ứng dụng đầu tiên
  const latestUpdates = array.sort((a, b) => b.rating - a.rating).slice(0, 6);

  // Lấy tất cả các ứng dụng còn lại
  const commons = array.filter(
    (app) => !topDownloads.includes(app) && !latestUpdates.includes(app)
  );
  return res.render(namePage, {
    topRankings: topDownloads,
    newUpdate: latestUpdates,
    common: commons,
    username: req.session.name,
  });
}

async function increaseDownloadCount() {
  // Lấy đối tượng Static tương ứng với ngày hiện tại (nếu chưa có sẽ tạo mới)
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const nowUTC = now.toISOString();

  let staticData = await Static.findOne({
    date: nowUTC,
  });
  if (!staticData) {
    staticData = new Static({ date: nowUTC });
  }

  // Tăng giá trị của appDownloads lên 1 và lưu lại
  staticData.webViews += 1;
  await staticData.save();
}

module.exports = {
  renderHome: renderHome,
  renderAbout: renderAbout,
  renderContact: renderContact,
  renderApps: renderApps,
  renderGames: renderGames,
  renderBooks: renderBooks,
  handleData: handleData,
  detailApp: detailApp,
  requireLogin: requireLogin,
  getAllComments: getAllComments,
  handelComment: handelComment,
  handelSearch: handelSearch,
  resultForSearch: resultForSearch,
};
