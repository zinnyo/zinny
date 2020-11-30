const mongoose = require("mongoose");

const appointment = new mongoose.Schema({
  messengerId: String,
  service_name: String,
  profileUrl: String,
  name: String,
  phNo: String,
  address: String,
  description: String,
  date: String,
  time: String,
  createdBy: {
    type: Date,
    default: Date.now,
  },
  accepted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("appointment", appointment);
