const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
	{
		productName: {
			type: String,
			required: [true,"productName is required!"]
		},
		description: {
			type: String,
			required: [true,"description is required!"]
		},
		price: {
			type: Number,
			required: [true,"price is required!"]
		},
		stocks: {
			type: Number,
			required: [true,"stocks is required!"]
		},
		isActive: {
			type: Boolean,
			default:true
		},
		createdOn: {
			type: Date,
			default: new Date()
		},
		image:{
			type: String,
			default:"https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-3_large.png?format=webp&v=1530129341"
		}
	}
);

module.exports = mongoose.model("Product",productSchema);