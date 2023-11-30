const express = require('express');
const cartController = require('../controllers/cart');
const auth = require("../auth");

const { verify, verifyAdmin } = auth;

// [SECTION] Routing Component
const router  = express.Router();

// [SECTION] Routes

// Add to Cart
router.post("/add", verify, cartController.addProduct);

// Edit the quantity of a product in cart
router.put("/edit",verify, cartController.editQuantity);

// Delete a product from the cart
router.delete("/delete",verify, cartController.deleteProduct);

// [SECTION] Export Route System
module.exports = router;