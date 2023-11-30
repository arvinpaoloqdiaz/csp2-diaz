const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const bcrypt = require('bcrypt');
const auth = require("../auth");

// [SECTION] Update Status
module.exports.updateStatus = async (req,res) => {
	try{
		if (req.body.status !== "pending" && req.body.status !==  "in transit" && req.body.status !==  "completed" && req.body.status !==  "canceled"){
			return res.status(409).send("Not a Possible status");
		}
		let newStatus = {status:req.body.status};
		let order = await Order.findByIdAndUpdate(req.body.orderId,newStatus);
		if(!order){
			return res.status(404).send("Order does not exists!");
		}
		let newOrder = await Order.findById(req.body.orderId);
		res.status(200).send({message:newOrder.status});
	}catch(err){
		return res.status(500).send(err);
	}
};


