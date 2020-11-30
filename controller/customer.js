const Appointment = require("../models/appointment");
const Member = require("../models/member");
const Trade = require("../models/trade");
const Products = require("../models/products");
const Orders = require("../models/order");

var cloudinary = require("cloudinary").v2;
const DatauriParser = require("datauri/parser");
const parser = new DatauriParser();

exports.renderHome = async (req, res) => {
  try {
    const products = await Products.find();

    return res.render("customer/index", {
      products,
      message: "",
      id: req.params.id,
    });
  } catch (e) {}
};

exports.render_trade = (req, res) => {
  res.render("customer/trade", { error: "", success: "", id: req.params.id });
};

exports.renderOrder = async (req, res) => {
  try {
    const member = await Member.findOne({ messengerId: req.params.customerId });

    const product = await Products.findOne({ code: req.params.id });

    if (!product) {
      return res.redirect("../");
    }

    if (member) {
      return res.render("customer/order", {
        error: "",
        success: "",
        product: product,
        id: req.params.customerId,
        member,
        point: member.point,
      });
    } else {
      return res.render("customer/order", {
        error: "",
        success: "",
        product: product,
        member,
        id: req.params.customerId,
        point: "",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.filterProducts = async (req, res) => {
  const type = req.body.type;

  var products;
  try {
    if (type == "All") {
      console.log("this work");
      products = await Products.find();
    } else {
      console.log("one");
      products = await Products.find({ type: { $in: req.body.type } });
    }

    return res.render("customer/index", {
      id: req.params.id,
      products,
      message: "",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.checkMember = async (req, res) => {
  try {
    const member = await Member.findOne({
      messengerId: req.params.id,
      verfied: true,
    });

    console.log(member);

    if (member) {
      return res.json({
        messages: [
          {
            text: `Name: ${member.name}\nPoint: ${member.point}\nEmail: ${member.email}\n Ph No: ${member.phNo}`,
          },
        ],
      });
    } else {
      return res.json({
        messages: [
          {
            text: "Dear customer! You are still not a member yet.",
          },
        ],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.findOneProduct = async (req, res) => {
  console.log(req.params.code);
  try {
    const product = await Products.findOne({ code: req.params.code });

    if (product) {
      return res.json({
        messages: [
          {
            attachment: {
              type: "image",
              payload: {
                url: product.photo,
              },
            },
          },
          {
            text: `Name: ${product.name}\nDescription: ${
              product.description
            }\nPrice:$${product.price}\nAvailable: ${
              product.available ? "yes" : "no"
            }`,
          },
        ],
      });
    } else {
      return res.json({
        messages: [{ text: "Product Not Found" }],
      });
    }
  } catch (e) {}
};

exports.itemOrder = async (req, res) => {
  try {
    let {
      name,
      email,
      productName,
      address,
      phNo,
      qty,
      point,
      code,
    } = req.body;
    if (!point) {
      point = 0;
    }
    const item = await Products.findOne({ code });
    const cost = qty * item.price - point;
    const getPoint = (qty * item.price - point) / 10;

    const member = await Member.findOne({ messengerId: req.params.customerId });

    if (member) {
      const updatedPoint = Math.round(member.point - point + getPoint);

      const order = await Orders.create({
        memberId: req.params.customerId,
        code,
        name,
        productName,
        email,
        phNo,
        address,
        qty,
        cost,
        status: "pending",
        bonusPoint: getPoint,
        usedPoint: point,
      });

      if (order) {
        //  const updated = await Member.updateOne({messengerId: req.params.customerId}, {$set: {point: updatedPoint}});
        return res.render("customer/order", {
          error: "",
          success: `Item code ${code} has been ordered. Your Original Point ${member.point}, Used Point ${point}, Bonus Point ${getPoint}, Future Point ${updatedPoint}  `,
          product: "",
          id: req.params.customerId,
          point: "",
        });
      }
    } else {
      const order = await Orders.create({
        memberId: req.params.customerId,
        code,
        name,
        productName,
        email,
        phNo,
        address,
        qty,
        cost,
        status: "pending",
      });
      console.log(order);
      if (order) {
        return res.render("customer/order", {
          error: "",
          success: `Item code ${code} has been ordered.`,
          product: "",
          id: req.params.customerId,
          point: "",
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.viewOrder = async (req, res) => {
  try {
    const order = await Orders.find({ memberId: req.params.id });

    res.render("customer/view_order", { id: req.params.id, orders: order });
  } catch (e) {}
};

exports.trade = async (req, res) => {
  try {
    const {
      name,
      email,
      phNo,
      address,
      item_name,
      type,
      description,
    } = req.body;

    const price = parseInt(req.body.price);

    const buffered = parser.format(".png", req.file.buffer);

    const uploadedPhoto = await cloudinary.uploader.upload(buffered.content);

    if (uploadedPhoto.secure_url) {
      const created = await Trade.create({
        memberId: req.params.id,
        photo: uploadedPhoto.secure_url,
        name,
        email,
        phNo,
        address,
        item_name,
        price,
        type,
        description,
        // price: price,
        // available: available,
        // name: req.body.name,
        // code: req.body.code,
        // description: req.body.description,
        // type: req.body.type,
      });

      if (created) {
        res.render("customer/trade", {
          id: req.params.id,
          error: "",
          success: `Your Trade is in pending to be accepted`,
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.render("customer/trade", {
      id: req.params.id,
      error: "Error Occured in your Trade",
      success: ``,
    });
  }
};

exports.viewTrade = async (req, res) => {
  try {
    const trade = await Trade.find({
      memberId: { $ne: req.params.id },
      accepted: true,
    });

    if (trade.length) {
      return res.render("customer/view_trade", {
        trades: trade,
        id: req.params.id,
      });
    } else {
      return res.render("customer/view_trade", {
        trades: [],
        id: req.params.id,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.viewMyTrade = async (req, res) => {
  try {
    const trade = await Trade.find({ memberId: req.params.id, traded: false });
    if (trade.length) {
      return res.render("customer/my_trade", {
        trades: trade,
        id: req.params.id,
        message: "",
      });
    } else {
      return res.render("customer/my_trade", {
        trades: [],
        id: req.params.id,
        message: "",
      });
    }
  } catch (e) {}
};

exports.soldOut = async (req, res) => {
  try {
    const trade = await Trade.findByIdAndUpdate(req.body.id, {
      $set: { traded: true },
    });
    const trades = await Trade.find({ memberId: req.params.id, traded: false });
    if (trade.length) {
      return res.render("customer/my_trade", {
        trades,
        id: req.params.id,
        message: "Success",
      });
    } else {
      return res.render("customer/my_trade", {
        trades: [],
        id: req.params.id,
        message: "Success",
      });
    }
  } catch (e) {}
};

exports.editMyTrade = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.tradeId);
    res.render("customer/editTrade", { trade, message: "", id: req.params.id });
  } catch (e) {}
};

exports.editTrade = async (req, res) => {
  try {
    const update = await Trade.findByIdAndUpdate(req.params.tradeId, {
      $set: req.body,
    });

    if (update) {
      const trade = await Trade.findById(req.params.tradeId);
      res.render("customer/editTrade", {
        trade,
        message: "Trade Edited",
        id: req.params.id,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.makeAppointment = async (req, res) => {
  try {
    const messengerId = req.body["messenger user id"];
    const profileUrl = req.body["profile pic url"];
    const service_name = req.body.service_name;
    const name = req.body.name;
    const phNo = req.body.phNo;
    const address = req.body.address;
    const time = req.body.time;
    const date = req.body.date;
    const description = req.body.description;

    const appointment = await Appointment.findOne({
      messengerId,
      accepted: false,
    });

    if (appointment) {
      return res.json({
        messages: [
          {
            text:
              "Your appointment is in pending state and you cannot do it again right now!",
          },
        ],
      });
    }

    const appointed = await Appointment.create({
      messengerId,
      service_name,
      profileUrl,
      name,
      phNo,
      address,
      time,
      date,
      description,
    });

    if (appointed) {
      return res.json({
        messages: [
          {
            text: "Your Appointment Information is",
          },
          {
            text: `Service: ${service_name}\nName:${name}\nPh No: ${phNo}\nAddress:${address}\nDescription:${description}\nDate: ${date}\nTime: ${time}`,
          },
        ],
      });
    }
  } catch (e) {
    console.log(e);
    return res.json({
      messages: [
        {
          text: "Error occur during appointment",
        },
      ],
    });
  }
};

exports.become_member = async (req, res) => {
  try {
    const messengerId = req.body["messenger user id"];
    const profileUrl = req.body["profile pic url"];
    console.log(`profileUrl ${profileUrl}`);
    const name = req.body.name;
    const phNo = req.body.phNo;
    const email = req.body.email;

    const pending = await Member.findOne({ messengerId });

    if (!pending) {
      const created = await Member.create({
        messengerId,
        profileUrl,
        name,
        phNo,
        email,
      });

      if (created) {
        return res.json({
          messages: [
            {
              text:
                "Dear Customer! Please wait for admin to accept you as a member. Thank You!",
            },
          ],
        });
      }
    } else {
      if (pending.verfied) {
        return res.json({
          messages: [
            {
              text: "You are already a member",
            },
          ],
        });
      }

      return res.json({
        messages: [
          {
            text:
              "Your membership is in pending state. Please await for admin to confirm you as a member",
          },
        ],
      });
    }
  } catch (e) {
    console.log(e);
    return res.json({
      messages: [
        {
          text: "Error occur during membership",
        },
      ],
    });
  }
};
