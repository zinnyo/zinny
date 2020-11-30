const mongoose = require("mongoose");

const product = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
    },
  name: String,
  type: String,
  photo: String,
  available: Boolean,
  price: Number,
  description: String,
});

module.exports = mongoose.model("product", product);
