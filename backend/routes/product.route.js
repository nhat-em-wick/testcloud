const express = require("express");
const productController = require("../controllers/product.controller");
const verifyToken = require("../middleware/verifyToken");
const checkAdmin = require("../middleware/checkAdmin");
const router = express.Router();
const checkInput = require("../middleware/checkinput");
const upload = require("../middleware/uploadProduct");
const cloudinary = require("../middleware/clouldinary");
const fs = require('fs');
router.get(
  "/products/search",
  checkInput.search,
  productController.searchProduct
);
router.get("/products", productController.listProduct);
router.get("/listjson", productController.listJson);
//admin
router.get(
  "/admin/products",
  verifyToken,
  checkAdmin,
  productController.admin_product
);
router.get(
  "/admin/products/search",
  verifyToken,
  checkAdmin,
  productController.adminSearch
);
router.get(
  "/admin/products/add",
  verifyToken,
  checkAdmin,
  productController.pageAddProduct
);
router.post(
  "/admin/products/add",
  verifyToken,
  checkAdmin,
  upload.single("mybook"),
  productController.addProduct
);
router.get(
  "/admin/viewproduct/:id",
  verifyToken,
  checkAdmin,
  productController.showProduct
);
router.get(
  "/admin/products/edit/:id",
  verifyToken,
  checkAdmin,
  productController.showEditProduct
);
router.put(
  "/admin/products/edit/:id",
  verifyToken,
  checkAdmin,
  upload.single("mybook"),
  productController.editProduct
);

router.delete(
  "/admin/products/:id",
  verifyToken,
  checkAdmin,
  productController.deleteImage,
  productController.deleteProduct
);

module.exports = router;
