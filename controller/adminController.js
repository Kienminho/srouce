require("dotenv").config();
//const User = require("../model/User");
const App = require("../model/Apps");
const Static = require("../model/statistical");
const path = require("path");
const multer = require("multer");
const moments = require("moment-timezone");
const { google } = require("googleapis");
const fs = require("fs");
const User = require("../model/User");
const Comment = require("../model/Comments");

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

let adminValidator = async (req, res, next) => {
  if (!req.session.role) {
    return res.redirect("/");
  }
  return next();
};

let renderAdminLayout = async (req, res) => {
  let topApps = await App.find({ category: "A" })
    .sort({ nDownload: -1 })
    .limit(6);
  let topGames = await App.find({ category: "G" })
    .sort({ nDownload: -1 })
    .limit(6);
  let topBooks = await App.find({ category: "B" })
    .sort({ nDownload: -1 })
    .limit(6);

  let topUpload = await App.aggregate([
    {
      $group: {
        _id: "$uploadBy",
        total: { $sum: 1 },
      },
    },
  ]);

  topUpload.forEach((element) => {
    if (element._id == "none" || element._id == "null") {
      topUpload.splice(topUpload.indexOf(element), 1);
    }
  });
  sortedInput = topUpload.slice().sort((a, b) => b.total - a.total);
  const slicedArray = sortedInput.slice(0, 10);

  return res.render("admin_home", {
    topApps: topApps,
    topGames: topGames,
    topBooks: topBooks,
    topUpload: slicedArray,
    layout: "adminLayouts",
  });
};
// trả về giao diện upload của admin
let renderUploadRequests = async (req, res) => {
  let app = await App.find({ status: 0 });
  return res.render("upload_manager", {
    apps: app,
    layout: "adminLayouts",
  });
};

//set quyền truy cập public cho file
let setFilePublic = async (fileId) => {
  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
    const getUrl = await drive.files.get({
      fileId,
      fields: "webViewLink, webContentLink",
    });
    return getUrl;
  } catch (error) {
    console.error(error);
  }
};

let uploadToCloud = async (req, res) => {
  try {
    console.log(req.body.id);
    let app = await App.findOne({ idApp: req.body.id });

    var createFile;
    if (app.category == "A" || app.category == "G") {
      let appName = app.nameApp.replace(" ", "-") + ".apk";
      createFile = await drive.files.create({
        requestBody: {
          name: appName,
          parents: "1wLqrP9hag1LNS-wpVlDVaJEkOwl-Jc14",
          mimeType: "application/octet-stream",
        },
        media: {
          mimeType: "application/octet-stream",
          body: fs.createReadStream("./" + app.source),
        },
      });
    } else {
      // category == book
      let appName = app.nameApp.replace(" ", "-") + ".pdf";
      createFile = await drive.files.create({
        requestBody: {
          name: appName,
          parents: "1wLqrP9hag1LNS-wpVlDVaJEkOwl-Jc14",
          mimeType: "application/pdf",
        },
        media: {
          mimeType: "application/pdf",
          body: fs.createReadStream("./" + app.source),
        },
      });
    }
    const fileId = createFile.data.id;
    //view file
    console.log(createFile.data);
    const getUrl = await setFilePublic(fileId);
    //link download
    console.log(getUrl.data);
    //update link download and status
    fs.unlinkSync(app.source);
    const imgAppsPath = path.join("public", "images", "imgApps");
    const filenameUpdate = app.idApp.toLowerCase();
    const newFileName = app.idApp.toLowerCase() + ".png";
    fs.rename(app.image, path.join(imgAppsPath, newFileName), (err) => {
      if (err) {
        // xử lý lỗi
        console.error(err);
      } else {
        // xử lý thành công
      }
    });
    console.log(newFileName);
    const doc = await App.findOneAndUpdate(
      { idApp: req.body.id },
      { source: getUrl.data.webContentLink, status: 1, image: newFileName }
    );
    return res.json({ status: 200, message: "Xét duyệt thành công" });
  } catch (error) {
    console.error(error);
  }
};

let rejectUpload = async (req, res) => {
  const doc = await App.findOneAndUpdate(
    { idApp: req.body.id },
    { status: -1 }
  );
  return res.json({ status: 200, message: "Phê duyệt thành công" });
};

//lấy dữ liệu truy cập, download để thống kê
let getStatistics = async (req, res) => {
  // Lấy dữ liệu thống kê theo tuần
  const weeklyStats = await Static.getWeeklyPageViewsByDayOfWeek();
  //mảng chứa webviews
  const data = weeklyStats.map((item) => ({
    date: item.date.toLocaleDateString("en-GB"),
    webViews: item.webViews,
    appDownloads: item.appDownloads,
  }));

  return res.json({ data: data });
};

let renderUserControl = async (req, res) => {
  let users = await User.find({ role: "user" });
  console.log(users);
  return res.render("user_manager", {
    users: users,
    layout: "adminLayouts",
  });
};

let updateUser = async (req, res) => {
  let user = await User.findOne({ username: req.body.username });
  if (!user) {
    return res.json({ message: "This user did not exist" });
  }

  if (req.body.username == req.body.newUsername) {
    await User.findOneAndUpdate(
      { username: req.body.username },
      { email: req.body.email }
    );
    return res.json({ message: "success" });
  }

  let secondUser = await User.findOne({ username: req.body.newUsername });
  if (secondUser) {
    return res.json({ message: "This username has been used" });
  }
  await User.findOneAndUpdate(
    { username: req.body.username },
    { username: req.body.newUsername, email: req.body.email }
  );
  return res.json({ message: "success" });
};

let blockUser = async (req, res) => {
  let user = await User.findOne({ username: req.body.username });
  if (!user) {
    return res.json({ message: "This user did not exist" });
  }
  if (user.status == 1) {
    user.status = 0;
  } else {
    user.status = 1;
  }
  await user.save();
  return res.json({ message: "success" });
};

let renderAppControl = async (req, res) => {
  let apps = await App.find({ status: { $ne: 0 } });
  if (!apps) {
    return res.json({ message: "Error" });
  } else {
    return res.render("app_manager", {
      apps: apps,
      layout: "adminLayouts",
    });
  }
};

let uploadByAdmin = async (req, res, next) => {
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
      status: 0,
      category: req.body.category,
      uploadBy: req.session.name,
    });
    await newApp.save();
    req.body.id = newApp.idApp;
    next();
  } catch (error) {
    console.log(error);
  }
};

let blockApp = async (req, res) => {
  let app = await App.findOne({ idApp: req.body.idApp });
  if (!app) {
    return res.json({ message: "This app does not exist" });
  }
  if (app.status == 1) {
    app.status = -1;
  } else {
    app.status = 1;
  }
  await app.save();
  return res.json({ message: "success" });
};

let updateDetails = async (req, res) => {
  let app = await App.findOne({ idApp: req.body.idApp });
  if (!app) {
    return res.json({ message: "This app does not exist" });
  }

  app.nameApp = req.body.nameApp;
  app.description = req.body.description;
  app.category = req.body.category;
  await app.save();
  return res.json({ message: "success" });
};

let updateImage = async (req, res) => {
  try {
    var file = req.file;
    if (!file) {
      return res.json({ message: "Invalid file" });
    }
    let app = await App.findOne({ idApp: req.body.idApp });
    if (!app) {
      return res.json({ message: "File does not exist" });
    }
    const imgAppsPath = path.join("public", "images", "imgApps");
    const newPath = app.idApp.toLowerCase() + ".png";
    //console.log(req.body.idApp)
    //console.log(file["image"][0].path)
    fs.renameSync(file.path, path.join(imgAppsPath, newPath), (err) => {
      if (err) {
        // xử lý lỗi
        console.error(err);
      } else {
        // xử lý thành công
      }
    });
    return res.json({ message: "success" });
  } catch (error) {
    console.log(error);
  }
};

let updateFile = async (req, res) => {
  try {
    var file = req.file;
    if (!file) {
      return res.json({ message: "Invalid file" });
    }

    let app = await App.findOne({ idApp: req.body.idApp });
    if (!app) {
      return res.json({ message: "File does not exist" });
    }

    var createFile;
    if (app.category == "A" || app.category == "G") {
      let appName = app.nameApp.replace(/\s/g, "-") + ".apk";
      createFile = await drive.files.create({
        requestBody: {
          name: appName,
          parents: "1wLqrP9hag1LNS-wpVlDVaJEkOwl-Jc14",
          mimeType: "application/octet-stream",
        },
        media: {
          mimeType: "application/octet-stream",
          body: fs.createReadStream("./" + file.path),
        },
      });
    } else {
      // category == book
      let appName = app.nameApp.replace(" ", "-") + ".pdf";
      createFile = await drive.files.create({
        requestBody: {
          name: appName,
          parents: "1wLqrP9hag1LNS-wpVlDVaJEkOwl-Jc14",
          mimeType: "application/pdf",
        },
        media: {
          mimeType: "application/pdf",
          body: fs.createReadStream("./" + file.path),
        },
      });
    }
    const fileId = createFile.data.id;
    //view file
    console.log(createFile.data);
    const getUrl = await setFilePublic(fileId);
    //link download
    tempFieldId = app.source;
    console.log(getUrl.data);
    app.source = getUrl.data.webContentLink;
    tempFieldId = tempFieldId.split("/")[3];
    tempFieldId = tempFieldId.split("=")[1];
    tempFieldId = tempFieldId.split("&")[0];
    try {
      console.log("Delete File:::", tempFieldId);
      const deleteFile = await drive.files.delete({
        fileId: tempFieldId,
      });
      console.log(deleteFile.data, deleteFile.status);
    } catch (error) {
      console.error(error);
    }

    await app.save();
    //update link download and status
    fs.unlinkSync(file.path);
    return res.json({ message: "success" });
  } catch (error) {
    console.log(error);
  }
};

let renderComments = async (req, res) => {
  let app = await App.findOne({ idApp: req.params.idApp });
  let comments = await Comment.find({ idApp: app._id });
  return res.render("comment", {
    app: app,
    comments: comments,
    layout: "adminLayouts",
  });
};

let deleteComment = async (req, res) => {
  await Comment.deleteOne({ _id: req.body._id });
  return res.json({ message: "success" });
};

module.exports = {
  adminValidator: adminValidator,
  renderAdminLayout: renderAdminLayout,
  renderUploadRequests: renderUploadRequests,
  uploadToCloud: uploadToCloud,
  rejectUpload: rejectUpload,
  getStatistics: getStatistics,
  renderUserControl: renderUserControl,
  updateUser: updateUser,
  blockUser: blockUser,
  renderAppControl: renderAppControl,
  uploadByAdmin: uploadByAdmin,
  blockApp: blockApp,
  updateDetails: updateDetails,
  updateImage: updateImage,
  updateFile: updateFile,
  renderComments: renderComments,
  deleteComment: deleteComment,
};
