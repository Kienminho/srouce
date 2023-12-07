const mongoose = require("../config/mongoose");

// Định nghĩa schema cho người dùng
const appSchema = new mongoose.Schema({
  idApp: {
    type: String,
    required: true,
  },
  nameApp: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  // book/application/game
  category: {
    type: String,
    required: true,
    default: "none",
  },
  description: {
    type: String,
  },
  // 0: pending/ -1: unavailable / 1: available
  status: {
    type: Number,
    required: true,
    default: 0,
  },
  rating: {
    type: Number,
    required: true,
    default: 0,
  },
  nDownload: {
    type: Number,
    required: true,
    default: 0,
  },
  uploadBy: {
    type: String,
    required: true,
    default: "none",
  },
});

const App = new mongoose.model("App", appSchema);

module.exports = App;
