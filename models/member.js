const mongoose = require("mongoose");

const member = new mongoose.Schema({
  messengerId: String,
  profileUrl: String,
  createdBy: {
    type: Date,
    default: Date.now,
  },
  name: String,
  email: String,
  phNo: String,
  verfied: {
    type: Boolean,
    default: false,
  },
  point: {
    type: Number,
    default: 5,
  },
});

module.exports = mongoose.model("member", member);
