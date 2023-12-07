const mongoose = require("../config/mongoose");

// Định nghĩa schema cho comment

const commentSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  idApp: {
    type: String,
    required: true,
  },
  date_time: {
    type: String,
    required: true,
  },
  ratings: {
    type: Number,
    min: 0,
    max: 5,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

const Comment = new mongoose.model("Comment", commentSchema);

module.exports = Comment;
