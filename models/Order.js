const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: [true, "userId is required!"]
		},
		productOrder: [
			{
				productId: {
					type: String,
					required: [true, "productId is required!"]
				},
				productName:{
					type: String
				},
				price: {
					type: Number,
					required: [true,"price is required!"]
				},
				quantity: {
					type: Number,
					required: [true,"quantity is required!"]
				},
				totalAmount: {
					type: Number,
					required: [true,"totalAmount is required!"]
				},
				purchasedOn: {
					type: Date,
					default: new Date()
				}
			}
		],
		status: {
			type: String,
			default: "pending"
		},
		total: {
			type: Number,
			default: 0
		}
	}
);

module.exports = mongoose.model("Order",orderSchema);