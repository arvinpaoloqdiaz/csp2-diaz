const express = require('express');
const orderController = require('../controllers/order');
const auth = require("../auth");

const { verify, verifyAdmin } = auth;

// [SECTION] Routing Component
const router  = express.Router();

// [SECTION] Routes

// Update order status

router.patch("/update-status", verify,verifyAdmin,orderController.updateStatus);

// [SECTION] Export Route System
module.exports = router;