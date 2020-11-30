const express = require("express");
const multer = require("multer");
var storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const {
  addProducts,
  deleteProducts,
  verifyMember,
  render_addProduct,
  acceptDeclineMember,
  renderHome,
  gettingAppointment,
  acceptDeclineAppointment,
  viewTrade,
  trade,
  renderOrder,
  order,
  deleteOrder,
  render_editProduct,
  editProduct,
  deleteMember,
  renderMember,
  memberAcceptDelete,
  renderAppointment,
  appointmentAcceptDelete,
  getLogin,
  login,
  ensureLogin,
  logout,
} = require("../controller/admin");

const router = express.Router();

router.route("/login").get(getLogin).post(login);
router.route("/logout").get(logout);

router.route("/").get(ensureLogin, renderHome);
router
  .route("/add")
  .get(ensureLogin, render_addProduct)
  .post(upload.single("file"), addProducts);

// .get(getProduct);

router
  .route("/edit/:id")
  .get(ensureLogin, render_editProduct)
  .post(editProduct);

router.route("/trade").get(ensureLogin, viewTrade).post(trade);
router.route("/order/").get(ensureLogin, renderOrder).post(order);

router.route("/order/:id").get(ensureLogin, deleteOrder);

// web
router
  .route("/members")
  .get(ensureLogin, renderMember)
  .post(memberAcceptDelete);

// bot
router.route("/member").get(verifyMember).post(acceptDeclineMember);

// web
router
  .route("/appointments")
  .get(ensureLogin, renderAppointment)
  .post(appointmentAcceptDelete);

// bot
router.route("/appointment").get(gettingAppointment);

router.route("/dltProducts").post(deleteProducts);

router.route("/acceptdecline_appointment").post(acceptDeclineAppointment);
// router.route("/editProduct").post(editProduct);

router.route("/delete-member").post(deleteMember);

module.exports = router;
