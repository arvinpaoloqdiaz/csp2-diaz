const express = require('express');
const userController = require('../controllers/user');
const auth = require("../auth");

const { verify, verifyAdmin } = auth;

// [SECTION] Routing Component
const router  = express.Router();

// [SECTION] Routes

// Register a user
router.post("/register", userController.registerUser);

// Login a user
router.post("/login", userController.loginUser);

// Get Details of a user
router.get("/userDetails", verify, userController.getDetails);

// Set user as Admin
router.put("/:userId/setAsAdmin",verify, verifyAdmin, userController.setAdmin);

// Get all orders
router.get("/orders",verify,verifyAdmin,userController.getAllOrder);

// Get order of specific user
router.get("/myOrders",verify, userController.getOrder);

// Create Order
router.post("/checkout",verify,userController.createOrder);

router.get("/cart",verify,userController.getCart);

router.put("/reset-password",verify,userController.resetPassword);

router.put("/update-profile",verify,userController.updateProfile);

router.get("/get-user-details/:userId",verify,verifyAdmin,userController.getUserDetails);

router.get("/get-all-users",verify,verifyAdmin,userController.getAllUsers)

// [SECTION] Export Route System
module.exports = router;