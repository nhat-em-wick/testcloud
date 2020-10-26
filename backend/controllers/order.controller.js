const orderModel = require("../models/order.model");
const productModel = require("../models/product.model");
const jwt = require("jsonwebtoken");
var mongoose = require("mongoose");
const pagination = require("./pagination");

module.exports.adminSearch = async (req, res) => {
  let q = req.query.q;
  try{
    const orders = await orderModel.find().populate("customerId", "-password");
    let matchedOrders = orders.filter((order) => {
      return order.customerId.name.toLowerCase().indexOf(q.toLowerCase()) !== -1; // neu q nam trong title thi gia tri lon hon -1
    });
    let page = parseInt(req.query.page) || 1;
    let perPage = 4; // item in page
    if (matchedOrders.length < 1) {
      req.flash("error", `No results for: ${q}`);
      req.flash("q", q);
      res.redirect("/admin/orders");
    } else {
      req.flash("q", q);
      res.render("admin/admin_order", pagination(page, perPage, matchedOrders));
    }
  }catch (e) {
    res.status(500).send(e);
  }
  
};

module.exports.order = async (req, res) => {
  const { phone, address } = req.body;
  try {
    const order = new orderModel({
      customerId: req.user._id,
      items: req.session.cart.items,
      phone: phone,
      address: address,
      totalQty: req.session.cart.totalQty,
      totalPrice: req.session.cart.totalPrice,
    });
    const newOrder = await order.save();
    // update sl trong kho
    for (let product of Object.values(req.session.cart.items)) {
      const productTotalQty = await productModel.findById(product.item._id);
      productTotalQty.totalQty -= product.qty;
      const updateProductTotalQty = await productTotalQty.save();
    }
    delete req.session.cart;
    req.flash('success', "Order placed successfully");
    res.redirect("/orders");
  } catch (e) {
   res.status(500).send(e);
  }
};

module.exports.showOrderUser = async (req, res) => {
  try {
    const id = mongoose.Types.ObjectId(req.user._id);
    const orders = await orderModel.find({ customerId: id });
    return res.render("orders/index", { orders: orders });
  } catch (err) {
    res.status(500).send(e);
  }
};

module.exports.statusOrder = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);
    res.render("orders/singleorder", { order: order });
  } catch (e) {
    res.status(500).send(e);

  }
};

module.exports.admin_order = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let perPage = 4; // item in page
    const orders = await orderModel.find().populate("customerId", "-password");
    res.render("admin/admin_order", pagination(page, perPage, orders));
  } catch (e) {
    res.status(500).send(e);
  }
};

module.exports.cancelOrder = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);
    for (let product of Object.values(order.items)) {
      const productStore = await productModel.findById(product.item._id);
      productStore.totalQty += product.qty;
      const updateProductStore = await productStore.save();
    }
    await orderModel.findByIdAndDelete(req.params.id);
    res.redirect("/orders");
  } catch (e) {
    res.status(500).send(e);
  }
};

module.exports.updateStatus = async (req, res) => {
  try {
    await orderModel.updateOne(
      { _id: req.body.orderId },
      { status: req.body.status }
    );
    const eventEmitter = req.app.get("eventEmitter");
    eventEmitter.emit("orderUpdated", {
      id: req.body.orderId,
      status: req.body.status,
    });
    res.redirect("/admin/orders");
  } catch (e) {
    res.status(500).send(e);
  }
};

module.exports.deleteOrder = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);
    for (let product of Object.values(order.items)) {
      const productTotalQty = await productModel.findById(product.item._id);
      productTotalQty.totalQty += product.qty;
      const updateProductStore = await productStore.save();
    }
    await orderModel.findByIdAndDelete(req.params.id);
    res.redirect("/admin/orders");
  } catch (e) {
    res.status(500).send(e);
  }
};
