const express = require('express');
const productController = require('../controllers/product');
const auth = require("../auth");

const { verify, verifyAdmin } = auth;

// [SECTION] Routing Component
const router  = express.Router();

// [SECTION] Routes

// Add Products (Admin Only)
router.post("/products", verify, verifyAdmin, productController.createProduct);

// Retrieve all products
router.get("/all", productController.getAllProducts);

// Retrieve all active products (Admin Only)
router.get("/products",verify,verifyAdmin,productController.getAllActiveProducts);

// Retrieve specific product
router.get("/:productId", productController.getProduct);

// Update Product Information (Admin Only)
router.put("/:productId",verify,verifyAdmin,productController.updateProduct);

// set Product's isActive to false (Admin Only)
router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct);

// set Product's isActive to true (Admin Only)
router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);

router.post("/search",productController.searchByName);

router.post("/search/price",productController.searchByPrice);
// [SECTION] Export Route System
module.exports = router;