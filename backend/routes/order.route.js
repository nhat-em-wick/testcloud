const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const verifyToken = require("../middleware/verifyToken");
const checkAdmin = require("../middleware/checkAdmin");
const checkInput = require("../middleware/checkinput");

router.get('/admin/orders/search', verifyToken, checkAdmin, orderController.adminSearch)
router.post("/orders", verifyToken, checkInput.checkOrder, orderController.order);
router.get("/orders", verifyToken, orderController.showOrderUser);
router.get('/orders/status/:id', verifyToken, orderController.statusOrder);
router.delete('/cancelorder/:id', verifyToken, orderController.cancelOrder);
router.get("/admin/orders", verifyToken, checkAdmin, orderController.admin_order);
router.post('/admin/orders/status',verifyToken, orderController.updateStatus)
router.delete("/admin/orders/:id", verifyToken, checkAdmin, orderController.deleteOrder);
module.exports = router;
