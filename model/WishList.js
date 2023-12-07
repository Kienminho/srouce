const mongoose = require("../config/mongoose");

// Định nghĩa schema cho comment

const wishlistSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "App",
    },
  ],
});

const WishList = new mongoose.model("WishList", wishlistSchema);

module.exports = WishList;
