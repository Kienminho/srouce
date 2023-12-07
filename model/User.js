const mongoose = require("../config/mongoose");

// Định nghĩa schema cho người dùng
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    require: true,
    default: "user",
  },
  status: {
    type: Number,
    require: true,
    default: 1,
  },
  createdAt: {
    type: Date,
    required: true,
  },
});

const User = new mongoose.model("User", userSchema);

module.exports = User;
