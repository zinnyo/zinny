const Products = require("../models/products");
const Members = require("../models/member");
const Appointments = require("../models/appointment");
const Trade = require("../models/trade");
const Order = require("../models/order");

var cloudinary = require("cloudinary").v2;
const DatauriParser = require("datauri/parser");
const parser = new DatauriParser();

exports.getLogin = (req, res) => {
  res.render("admin/login", {
    error: "",
  });
};

exports.login = (req, res) => {
  let error = "";

  if (req.body.username === "admin" && req.body.password === "zinny") {
    req.session.isLogined = true;
    return res.redirect("/admin/");
  } else if (!req.body.username) {
    console.log("in user", req.body);
    error = "Please insert  your username!";

    return res.render("admin/login", {
      error,
    });
  } else if (!req.body.password) {
    error = "Please insert your password!";

    return res.render("admin/login", {
      error,
    });
  } else {
    error = "The username or password that you've entered is incorrect.";

    return res.render("admin/login", {
      error,
    });
  }
};

exports.ensureLogin = (req, res, next) => {
  console.log("this happended", req.session, req.cookie);
  if (req.session.isLogined) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

exports.logout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
};

exports.renderHome = async (req, res) => {
  try {
    const products = await Products.find();

    return res.render("admin/index", {
      products,
      message: "",
    });
  } catch (e) {}
};

exports.render_addProduct = (req, res) => {
  res.render("admin/add", { error: "", success: "" });
};

exports.render_editProduct = async (req, res) => {
  try {
    const product = await Products.findOne({ code: req.params.id });

    if (product) {
      return res.render("admin/edit", { error: "", success: "", product });
    } else {
      return res.redirect("../");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderMember = async (req, res) => {
  try {
    const members = await Members.find();
    console.log(members);
    res.render("admin/member", { message: "", members });
  } catch (e) {}
};

exports.editProduct = async (req, res) => {
  try {
    const update = await Products.updateOne(
      { code: req.body.originalCode },
      {
        $set: {
          code: req.body.code,
          name: req.body.name,
          type: req.body.type,
          available: req.body.available,
          price: req.body.price,
          description: req.body.description,
        },
      }
    );

    if (update) {
      const product = await Products.findOne({ code: req.body.code });
      console.log("edit produt", product);
      return res.render("admin/edit", {
        error: "",
        success: "Product Edited",
        product,
      });
    } else {
      const product = await Products.findOne({ code: req.body.code });
      return res.render("admin/edit", {
        error: "Product Failed to Edit",
        success: "",
        product,
      });
    }
  } catch (e) {
    res.render("admin/edit", {
      error: "Edit Fail",
      success: "",
      product: false,
    });
    console.log(e);
  }
};

exports.addProducts = async (req, res) => {
  try {
    const instock = req.body.available;

    const price = parseInt(req.body.price);

    const existed = await Products.findOne({ productCode: req.body.code });

    if (existed) {
      return res.render("admin/add", {
        error: `Product Code ${req.body.code} is already existed`,
      });
    }

    const available = instock == "y" ? true : false;

    const buffered = parser.format(".png", req.file.buffer);

    const uploadedPhoto = await cloudinary.uploader.upload(buffered.content);

    if (uploadedPhoto.secure_url) {
      const created = await Products.create({
        photo: uploadedPhoto.secure_url,
        price: price,
        available: available,
        name: req.body.name,
        code: req.body.code,
        description: req.body.description,
        type: req.body.type,
      });

      if (created) {
        res.render("admin/add", {
          error: "",
          success: `Product Code ${req.body.code} is added`,
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.render("admin/add", {
      error: "Product Id is already existed or error occur in adding",
      success: ``,
    });
  }
};

exports.renderOrder = async (req, res) => {
  try {
    // const order = await Order.find();
    // console.log(order);
    const order = await Order.find();
    res.render("admin/order", { orders: order, message: "" });
  } catch (e) {
    console.log(e);
  }
};

exports.order = async (req, res) => {
  const { id, status } = req.body;
  try {
    const findOrder = await Order.findById(id);
    const member = await Members.findOne({ messengerId: findOrder.memberId });

    if (status == "accept") {
      await Order.updateOne({ _id: id }, { $set: { status: "accepted" } });
      if (member) {
        let updatedPoint = Math.round(
          member.point - findOrder.usedPoint + findOrder.bonusPoint
        );
        console.log(member, updatedPoint);
        await Members.findByIdAndUpdate(member._id, {
          $set: { point: updatedPoint },
        });
      }

      let order = await Order.find();
      return res.render("admin/order", {
        orders: order,
        message: "One order is accepted",
      });
    } else if (status == "decline") {
      await Order.updateOne({ _id: id }, { $set: { status: "declined" } });
      let order = await Order.find();
      return res.render("admin/order", {
        orders: order,
        message: "One order is declined",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.deleteOrder = async (req, res) => {
  console.log(req.params.id);
  try {
    await Order.findByIdAndDelete(req.params.id);
    let order = await Order.find();
    return res.render("admin/order", {
      orders: order,
      message: "One order is Deleted",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.trade = async (req, res) => {
  const { id, status } = req.body;

  try {
    if (status == "accept") {
      await Trade.updateOne({ _id: id }, { $set: { accepted: true } });
      let trade = await Trade.find();
      return res.render("admin/trade", {
        trades: trade,
        message: "One Trade is accepted",
      });
    } else if (status == "delete") {
      await Trade.findByIdAndDelete(id);
      let trade = await Trade.find();
      return res.render("admin/trade", {
        trades: trade,
        message: "One Trade is deleted",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const member = await Members.findOne({ phNo: req.body.phNo });
    if (member) {
      return res.json({
        messages: [{ text: "Deleted User" }],
      });
    } else {
      return res.json({
        messages: [{ text: "Cannot find member with this phone number" }],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.viewTrade = async (req, res) => {
  const trade = await Trade.find();

  return res.render("admin/trade", { trades: trade, message: "" });
};

exports.deleteProducts = async (req, res) => {
  try {
    const products = await Products.deleteOne({ code: req.body.pid });
    const renderProducts = await Products.find();
    if (products) {
      res.render("admin/index", {
        products: renderProducts,
        message: `${req.body.pid} is Deleted `,
      });
      // return res.json({
      //   messages: [
      //     {
      //       text:
      //         "Cannot Delete your Products because of error or Products not found. What do you want to do next?",
      //
      //     },
      //   ],
      // });
    }
  } catch (e) {
    res.json({
      messages: [{ text: "Error Occurs in deleting Products" }],
    });
  }
};

exports.verifyMember = async (req, res) => {
  try {
    const members = await Members.find({ verfied: false }).limit(10);

    const galleries = members.map((member) => {
      return {
        title: `${member.name}`,
        image_url: `${member.profileUrl}`,
        subtitle: `Ph No: ${member.phNo}\nEmail: ${member.email}`,
        buttons: [
          {
            type: "show_block",
            block_names: ["accept_declineMember"],
            title: "Accept",
            set_attributes: {
              member_id: member._id,
              condition: true,
            },
          },
          {
            type: "show_block",
            block_names: ["accept_declineMember"],
            title: "Decline",
            set_attributes: {
              member_id: member._id,
              condition: false,
            },
          },
        ],
      };
    });

    if (galleries.length == 0) {
      return res.json({
        messages: [{ text: "There is no requested users" }],
      });
    }

    return res.json({
      messages: [
        {
          attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              image_aspect_ratio: "square",
              elements: galleries,
            },
          },
        },
      ],
    });
  } catch (e) {
    console.log(e);
    res.json({
      messages: [
        {
          text: "Error occur in verifying member",
        },
      ],
    });
  }
};

exports.renderAppointment = async (req, res) => {
  try {
    const appointments = await Appointments.find();
    res.render("admin/appointment", { message: "", appointments });
  } catch (e) {}
};

exports.appointmentAcceptDelete = async (req, res) => {
  const { id, status } = req.body;

  try {
    if (status == "accept") {
      await Appointments.findByIdAndUpdate(id, { $set: { accepted: true } });
      let appointments = await Appointments.find();
      res.render("admin/appointment", {
        message: "One appointment accepted",
        appointments,
      });
    } else if (status == "delete") {
      await Appointments.findByIdAndDelete(id);
      let appointments = await Appointments.find();
      res.render("admin/appointment", {
        message: "One appointment deleted",
        appointments,
      });
    }
  } catch (e) {}
};

exports.memberAcceptDelete = async (req, res) => {
  const { id, status } = req.body;

  try {
    if (status == "accept") {
      await Members.findByIdAndUpdate(id, { $set: { verfied: true } });
      let members = await Members.find();
      res.render("admin/member", { message: "One member accepted", members });
    } else if (status == "delete") {
      await Members.findByIdAndDelete(id);
      let members = await Members.find();
      res.render("admin/member", { message: "One member deleted", members });
    }
  } catch (e) {}
};

exports.acceptDeclineMember = async (req, res) => {
  const { condition, member_id } = req.body;
  const member = await Members.findOne({ _id: member_id });
  try {
    if (condition == "true") {
      const updated = await Members.updateOne(
        { _id: member_id },
        {
          $set: {
            verfied: true,
          },
        }
      );

      if (updated) {
        return res.json({
          messages: [
            {
              text: "Member Information",
            },
            {
              text: `Name: ${member.name}\nEmail: ${member.email}\nPh No: ${member.phNo}`,
            },
            {
              text: "Member Accepted",
            },
          ],
        });
      }
    }

    const deleted = await Members.deleteOne({ _id: member_id });
    if (deleted) {
      return res.json({
        messages: [
          {
            text: `Member Name: ${member.name} is declined`,
          },
        ],
      });
    }
  } catch (e) {
    console.log(e);
    return res.json({
      messages: [
        {
          text: "Error Occur in accepting or declining member",
        },
      ],
    });
  }
};

exports.gettingAppointment = async (req, res) => {
  try {
    const appointments = await Appointments.find({ accepted: false }).limit(10);

    const galleries = appointments.map((appointment) => {
      return {
        title: `Name: ${appointment.name}\n.Service: ${appointment.service_name}`,
        image_url: `${appointment.profileUrl}`,
        subtitle: `Ph No: ${appointment.phNo}\n`,
        buttons: [
          {
            type: "show_block",
            block_names: ["accept_declineAppointment"],
            title: "Accept",
            set_attributes: {
              appointment_id: appointment._id,
              condition: true,
            },
          },
          {
            type: "show_block",
            block_names: ["accept_declineAppointment"],
            title: "Decline",
            set_attributes: {
              appointment_id: appointment._id,
              condition: false,
            },
          },
        ],
      };
    });

    if (galleries.length == 0) {
      return res.json({
        messages: [{ text: "There is no appointment" }],
      });
    }

    return res.json({
      messages: [
        {
          attachment: {
            type: "template",
            payload: {
              template_type: "generic",
              image_aspect_ratio: "square",
              elements: galleries,
            },
          },
        },
      ],
    });
  } catch (e) {
    console.log(e);
    res.json({
      messages: [
        {
          text: "Error occur in getting appointment",
        },
      ],
    });
  }
};

exports.acceptDeclineAppointment = async (req, res) => {
  const { condition, appointment_id } = req.body;
  const appointment = await Appointments.findOne({ _id: appointment_id });
  try {
    if (condition == "true") {
      const updated = await Appointments.updateOne(
        { _id: appointment_id },
        {
          $set: {
            accepted: true,
          },
        }
      );

      if (updated) {
        return res.json({
          messages: [
            {
              text: "Appointment Information",
            },
            {
              text: `Appointment: ${appointment.service_name}\nName: ${appointment.name}\nPh No: ${appointment.phNo}\nAddress: ${appointment.address}\nDate: ${appointment.date}\nTime: ${appointment.time}`,
            },
            {
              text: "Appointment Accepted",
            },
          ],
        });
      }
    }

    const deleted = await Appointments.deleteOne({ _id: appointment_id });
    if (deleted) {
      return res.json({
        messages: [
          {
            text: `Appointment ${appointment.service_name} Customer Name: ${appointment.name} is declined`,
          },
        ],
      });
    }
  } catch (e) {
    console.log(e);
    return res.json({
      messages: [
        {
          text: "Error Occur in accepting or declining member",
        },
      ],
    });
  }
};
