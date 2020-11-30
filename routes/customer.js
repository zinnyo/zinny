const express = require("express");
const multer = require("multer");
var storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const {
  makeAppointment,
  become_member,
  render_trade,
  renderHome,
  trade,
  renderOrder,
  // order,

  itemOrder,
  viewTrade,
  viewOrder,
  filterProducts,
  checkMember,
  findOneProduct,
  viewMyTrade,
  soldOut,
  editMyTrade,
  editTrade,
} = require("../controller/customer");

const router = express.Router();

router.route("/appointment").post(makeAppointment);
router.route("/member").post(become_member);
router.route("/check/:id").get(checkMember);
router.route("/findOneProduct/:code").get(findOneProduct);
router.route("/:id").get(renderHome).post(filterProducts);
router.route("/:customerId/order/:id").get(renderOrder).post(itemOrder);

// router.route("/order").post(order)
router.route("/:id/view-trade").get(viewTrade);
router.route("/:id/my-trade").get(viewMyTrade).post(soldOut);
router.route("/:id/my-trade/:tradeId").get(editMyTrade).post(editTrade);
router.route("/:id/view-order").get(viewOrder);

router.route("/:id/trade").get(render_trade).post(upload.single("file"), trade);

module.exports = router;
