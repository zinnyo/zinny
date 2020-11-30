const mongoose = require("mongoose");

const order = new mongoose.Schema({
    memberId: String,
    code: String,
    productName:String,
    name: String,
    email: String,
    phNo: String,
    address: String,
    qty: Number,
    cost: Number,
    status: String,
    usedPoint: Number,
    bonusPoint: Number
});

module.exports = mongoose.model("order", order);
