const mongoose = require("mongoose");

const trade = new mongoose.Schema({

  memberId: String,
  name: String,
  email: String,
  phNo: String,
  address: String,
  item_name: String,
  price: Number,
  type: String,
  photo: String,
  description: String,
  accepted: {
      type: Boolean,
      default: false
  },
  traded: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("trade", trade);
