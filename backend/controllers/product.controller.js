const productModel = require("../models/product.model");
const fs = require("fs");
const path = require("path");
const pagination = require("./pagination");
const cloudinary = require("../middleware/clouldinary");

module.exports.searchProduct = async (req, res) => {
  let q = req.query.q;
  let totalProducts = await productModel.find();
  let matchedProducts = totalProducts.filter((product) => {
    return product.title.toLowerCase().indexOf(q.toLowerCase()) !== -1; // neu q nam trong title thi gia tri lon hon -1
  });
  let page = parseInt(req.query.page) || 1;
  let perPage = 8; // item in page
  if (matchedProducts.length < 1) {
    req.flash("error", `No results for: ${q}`);
    req.flash("q", q);
    res.redirect("/products");
  } else {
    req.flash("q", q);
    res.render("products/index", pagination(page, perPage, matchedProducts));
  }
};

module.exports.adminSearch = async (req, res) => {
  let q = req.query.q;
  let totalProducts = await productModel.find();
  let matchedProducts = totalProducts.filter((product) => {
    return product.title.toLowerCase().indexOf(q.toLowerCase()) !== -1; // neu q nam trong title thi gia tri lon hon -1
  });
  let page = parseInt(req.query.page) || 1;
  let perPage = 6; // item in page
  if (matchedProducts.length < 1) {
    req.flash("error", `No results for: ${q}`);
    req.flash("q", q);
    res.redirect("/admin/products");
  } else {
    req.flash("q", q);
    res.render(
      "admin/admin_product",
      pagination(page, perPage, matchedProducts)
    );
  }
};
// get list product
module.exports.listProduct = async (req, res) => {
  try {
    // panigation
    let page = parseInt(req.query.page) || 1;
    let perPage = 6; // item in page
    let totalProducts = await productModel.find();
    res.render("products/index", pagination(page, perPage, totalProducts));
  } catch (err) {
    console.log(err);
  }
};

module.exports.listJson = async (req, res) => {
  try {
    let totalProducts = await productModel.find();
    res.json({ products: totalProducts });
  } catch (err) {
    console.log(err);
  }
};

module.exports.admin_product = async (req, res) => {
  try {
    // panigation
    let page = parseInt(req.query.page) || 1;
    let perPage = 4; // item in page
    let totalProducts = await productModel.find();
    res.render("admin/admin_product", pagination(page, perPage, totalProducts));
  } catch (err) {
    console.log(err);
    res.redirect('/admin/products')
  }
};

module.exports.pageAddProduct = (req, res) => {
  res.render("admin/addproduct");
};

// add product
module.exports.addProduct = async (req, res) => {
    const uploader = async (path) => await cloudinary.uploads(path, 'images')
    const file = req.file;
    const {path} = file;
    const newpath = await uploader(path);
    fs.unlinkSync(path)
    try {
      const product = new productModel({
        title: title,
        totalQty: totalQty,
        price: price,
        image: newpath.url
      });
      const saveProduct = await product.save();
      res.redirect(`/admin/viewproduct/${saveProduct._id}`);
    } catch (err) {
      console.log(err);
      res.redirect('/admin/products');
    }
};

module.exports.showProduct = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    res.render("admin/viewproduct", { product: product });
  } catch (err) {
    console.log(err);
    res.redirect("/admin/products");
  }
};

module.exports.showEditProduct = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
      res.render("admin/editproduct", { product: product });
  } catch (err) {
    console.log(err);
    res.redirect("/admin/products")
  }
};

module.exports.editProduct = async (req, res) => {
    const uploader = async (path) => await cloudinary.uploads(path, 'images')
    const file = req.file;
    const {path} = file;
    const newpath = await uploader(path);
    fs.unlinkSync(path)
    try {
      const product = await productModel.findById(req.params.id);
        product.title = title || product.title;
        product.price = price || product.price;
        product.totalQty = totalQty || product.totalQty;
        product.image = newpath.url || product.image;
        const updateProduct = await product.save();
        res.redirect(`/admin/viewproduct/${updateProduct._id}`);
    } catch (err) {
      res.redirect('/admin/products');
    }
};

//delete image in public
// module.exports.deleteImage = async (req, res, next) => {
//   const product = await productModel.findById(req.params.id);
//   const filePath = `public/${product.image}`;
//   fs.unlink(filePath, (err) => {
//     if (err) throw err;
//   });
//   next();
// };

module.exports.deleteProduct = async function (req, res) {
  try {
    await productModel.findByIdAndDelete(req.params.id);
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
  }
};
