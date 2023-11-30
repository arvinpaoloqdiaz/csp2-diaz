const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: [true, " userId is required!"]
		},
		cartProducts: [
			{
				productId:{
				type: String,
				required: [true, "orderId is required!"]
				},
				productName:{
					type: String,
					required: [true, "productName is required!"]
				},
				price: {
					type: Number,
					required: [true, "price is required"]
				},
				quantity: {
					type: Number,
					required: [true, "quantity is required!"]
				},
				subTotal:{
					type: Number,
					required: [true, "subTotal is required!"]
				},
				image:{
					type: String,
					required: [true, "Image is required!"]
				}
			}
		],
		total: {
			type: Number,
			default: 0
		}
		
	}
		
);

module.exports = mongoose.model("Cart",cartSchema);