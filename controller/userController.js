require("dotenv").config();
const WishList = require("../model/WishList");
const NumberDownload = require("../model/numberDownload");
const Static = require("../model/statistical");
const multer = require("multer");
const moment = require("moment-timezone");
const { google } = require("googleapis");
const App = require("../model/Apps");
const fs = require("fs");
const path = require("path");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

let storage = multer.diskStorage({
  destination(req, file, cb) {
    const path = "./public/waitlist/";
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
    cb(null, path);
  },
  filename(req, file, cb) {
    cb(
      null,
      path.parse(file.originalname).name +
        " - " +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});

let renderWishList = async (req, res) => {
  // sử dụng populate lấy ra thông tin các items
  const name = req.session.name;
  const wishlist = await WishList.findOne({
    username: name,
  }).populate("items");
  if (!wishlist) {
    return res.render("wishList", {
      username: name,
    });
  }
  res.render("wishList", {
    wishList: wishlist.items,
    username: name,
  });
};

//xử lý việc thêm wish list
let addWishList = async (req, res) => {
  const idAppCurrent = req.params.idAppCurrent;
  const name = req.session.name;
  const wishListByUser = await WishList.findOne({ username: name });
  //nếu không tồn tại tạo mới wish list cho người dùng
  if (!wishListByUser) {
    await WishList.create({ username: name, items: [idAppCurrent] });
  } else {
    if (wishListByUser.items.includes(idAppCurrent)) {
      return res.json({
        status: 300,
        message: "Ứng dụng đã tồn tại trong danh sách.",
      });
    }
    wishListByUser.items.push(idAppCurrent);
    await wishListByUser.save();
  }
  return res.json({ status: 200, message: "Thêm vào danh sách thành công." });
};

//xóa ứng dụng khỏi wish list
let deleteWishList = async (req, res) => {
  const id = req.params.id;
  const name = req.session.name;
  await WishList.findOneAndUpdate(
    { username: name },
    { $pull: { items: id } },
    { new: true }
  ).then(() => {
    return res.json({ status: 200, message: "Delete thành công" });
  });
};

//xử lý phần upload của user
let upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.fieldname === "file") {
      if (file.originalname.match(/\.(apk|pdf)$/)) {
        console.log(80);
        cb(null, true);
      } else {
        cb(null, false);
      }
    } else {
      if (file.originalname.match(/\.(jpg|png|jpeg)$/)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    }
  },
}).fields([
  { name: "file", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

let uploadImage = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

let uploadFile = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.originalname.match(/\.(apk|pdf)$/)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

//gửi yêu cầu upload
let sendUploadRequest = async (req, res) => {
  try {
    var file = req.files;
    if (!file) {
      return res.json({ msg: "Invalid file" });
    }
    const counter = await App.countDocuments({});
    const newApp = new App({
      idApp: "APP" + (counter + 1),
      nameApp: req.body.nameApp,
      image: file["image"][0].path,
      source: file["file"][0].path,
      description: req.body.description,
      owner: req.session.name,
      status: 0,
      category: req.body.category,
      uploadBy: req.session.name,
    });
    await newApp.save();
    return res.json({ msg: "File is uploaded!" });
  } catch (error) {
    console.log(error);
  }
};

//tăng button lượt download của ứng dụng
let increaseDownload = async (req, res) => {
  const idApp = req.body.idApp;
  const name = req.session.name;
  const downloadedByUser = await NumberDownload.findOne({ username: name });
  //nếu không tồn tại tạo mới wish list cho người dùng
  if (!downloadedByUser) {
    await NumberDownload.create({ username: name, itemsDownload: [idApp] });
    increaseDownloadCount(idApp);
  } else {
    //nếu không tồn tại ứng dụng thì  thêm vào db và tăng số lượng downloads
    if (!downloadedByUser.itemsDownload.includes(idApp)) {
      downloadedByUser.itemsDownload.push(idApp);
      await downloadedByUser.save();
      increaseDownloadCount(idApp);
    } else {
      increaseDownloadCount(idApp);
    }
  }
  return res.json({ status: 200, message: "Thêm vào danh sách thành công." });
};

//render phần donwload
let renderMyDownloads = async (req, res) => {
  // sử dụng populate lấy ra thông tin các items
  const name = req.session.name;
  const myDownloads = await NumberDownload.findOne({
    username: name,
  }).populate("itemsDownload");
  if (!myDownloads) {
    return res.render("myDownloads", {
      username: name,
    });
  }
  return res.render("myDownloads", {
    myDownloads: myDownloads.itemsDownload,
    username: name,
  });
};

async function increaseDownloadCount(id) {
  // Lấy đối tượng Static tương ứng với ngày hiện tại (nếu chưa có sẽ tạo mới)
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const nowUTC = now.toISOString();

  const [app, staticData] = await Promise.all([
    App.findOneAndUpdate(
      { _id: id },
      { $inc: { nDownload: 1 } },
      { new: true }
    ),
    Static.findOneAndUpdate(
      { date: nowUTC },
      { $inc: { appDownloads: 1 } },
      { new: true, upsert: true }
    ),
  ]);
}

module.exports = {
  renderWishList: renderWishList,
  addWishList: addWishList,
  deleteWishList: deleteWishList,
  upload: upload,
  sendUploadRequest: sendUploadRequest,
  increaseDownload: increaseDownload,
  renderMyDownloads: renderMyDownloads,
  uploadFile: uploadFile,
  uploadImage: uploadImage,
};
