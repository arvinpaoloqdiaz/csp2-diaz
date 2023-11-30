// Dependencies and Modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// By default web browsers prevents a website from making requests to a different domain. CORS relaex this rule, allowing us or our website to communicate securely with other websites.

const userRoutes = require('./routes/user');
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const cartRoutes = require("./routes/cart");

// Environment Setup
const port = 4001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

// [SECTION] Database Connection
	mongoose.connect("mongodb+srv://admin:admin@zuitt-bootcamp.hb9czsm.mongodb.net/Capstone2API?retryWrites=true&w=majority", 
	{
		useNewUrlParser: true,
		useUnifiedTopology: true
	});

	mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'));

// [SECTION] Backend Routes
	app.use("/b1/users", userRoutes);
	app.use("/b1/products", productRoutes);
	app.use("/b1/orders",orderRoutes);
	app.use("/b1/cart",cartRoutes);


if(require.main === module){
	app.listen(process.env.PORT || port, () => {
		console.log(`API is now online on localhost:${ process.env.PORT || port}`)
	})
}

module.exports = {app, mongoose};