const mongoose = require("../config/mongoose");

// Định nghĩa schema cho comment

const numberDownloadSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  itemsDownload: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "App",
    },
  ],
});

const numberDownload = new mongoose.model(
  "numberDownloadSchema",
  numberDownloadSchema
);

module.exports = numberDownload;
