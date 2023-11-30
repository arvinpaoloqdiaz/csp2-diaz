const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const bcrypt = require('bcrypt');
const auth = require("../auth");

// Add Product
/*
	Steps:
	1. Check to see if user is admin or regular.
    2. Check if there is existing userId. if there is, update the data, else, Create a new model through the Order Schema
    3. Check if product isActive: true
    4. Get Price of product by using the productId given.
    5. Get Total Amount by multiplying Quantity with price.
    6. Subtract quantity to total stocks of the product
    7. Check to see if Stocks are available, if not, cancel order, else, place the order
    8. If stocks = 0, set product isActive to false
    9. if order is placed, create an object newProductOrder and push it in ProductOrder. Change total.
    10. save new Model and return a message that order is succesfully placed!
*/
module.exports.addProduct = async (req,res) => {
	try{
        // Check if regular user
		if (req.user.isAdmin) {
		    return res.status(403).send("Action Forbidden, Non-Admin Only!");
		}
        
        // Retrieve entry that matches the user Id
		let cartOrder = await Cart.findOne({ userId: req.user.id });
            if (!cartOrder) {
                cartOrder = new Cart({
                    userId: req.user.id,
                    cartProducts :[]
                });
            };

            // Gets index of the product that matches the product id
      		const existingProductIndex = cartOrder.cartProducts.findIndex(
      		 (product) => product.productId.toString() === req.body.productId.toString()
      		 );

            // check if product is in cart , if in cart no add, and try updating
      		if(existingProductIndex !== -1){
      			return res.status(409).send({message:"Product already in cart!"});
      		}

            // Retrieve the product in database that matches product Id
            const product = await Product.findById(req.body.productId);

            // Check if product exists
            if (!product) {
                return res.status(404).send({message:"Product not found!"});
            }

            // check if product isActive is true
            if (product.isActive !== true){
                return res.status(404).send({message:"Product is inactive!"})
            }

            //check if quantity is enough based on product stocks
            if(product.stocks < req.body.quantity) {
                return res.status(404).send({message:"Not enough stocks in inventory!"})
            }
            // get price of product
            const productPrice = product.price;

            // calculate subTotal
            const subTotal = req.body.quantity * productPrice;

            const newCartOrder = {
                productId: req.body.productId,
                productName: product.productName,
                price: productPrice,
                quantity: req.body.quantity,
                subTotal: subTotal,
                image: product.image
            };

            cartOrder.cartProducts.push(newCartOrder);
            cartOrder.total += newCartOrder.subTotal;
            await cartOrder.save();
            return res.status(200).send({
                
                   message:"Added to Cart!"
                    // orders:cartOrder.cartProducts,
                    // total:cartOrder.total,
                    // status:cartOrder.status
            }
                
                );
	} catch(err){
		return res.status(500).send(err)
	}
};

module.exports.editQuantity = async (req,res) => {
	try{
		if (req.user.isAdmin) {
		    return res.status(403).send("Action Forbidden, Non-Admin Only!");
		};
		if(req.body.quantity < 0){
			return res.status(409).send("Cannot be a negative number!");
		}
		let editCart = await Cart.findOne({ userId: req.user.id });
            if (!editCart) {
               return res.status(404).send("No Cart!");
            };

        const editProductIndex = editCart.cartProducts.findIndex(
      		 (product) => product.productId.toString() === req.body.productId.toString()
      		 );

        if (editProductIndex == -1){
        	return res.status(404).send("Product is not in cart!");
        }
        editCart.total -= editCart.cartProducts[editProductIndex].subTotal;
        const product = await Product.findById(req.body.productId);

        editCart.cartProducts[editProductIndex].quantity = req.body.quantity;
        editCart.cartProducts[editProductIndex].subTotal = req.body.quantity * product.price;
        editCart.total += editCart.cartProducts[editProductIndex].subTotal;

        if ( editCart.cartProducts[editProductIndex].quantity == 0){
        	editCart.total -= editCart.cartProducts[editProductIndex].subTotal;
        	editCart.cartProducts.splice(editProductIndex,1);

        }
        await editCart.save();
        return res.status(200).send(true);
	}catch (err){
		return res.status(500).send(err);
	}
};

module.exports.deleteProduct = async (req,res) => {
	try {
		if (req.user.isAdmin) {
		    return res.status(403).send("Action Forbidden, Non-Admin Only!");
		};
		let deleteFromCart = await Cart.findOne({ userId: req.user.id });
            if (!deleteFromCart) {
               return res.status(404).send("No Cart!");
            };

        const deleteProductIndex = deleteFromCart.cartProducts.findIndex(
      		 (product) => product.productId.toString() === req.body.productId.toString()
      		 );
        if (deleteProductIndex == -1){
        	return res.status(404).send({message:"Product is not in cart!"});
        } else {
        	deleteFromCart.total -= deleteFromCart.cartProducts[deleteProductIndex].subTotal;
        	deleteFromCart.cartProducts.splice(deleteProductIndex,1);
        };
        
        await deleteFromCart.save();
        
        return res.status(201).send({message:"Deleted!"})

	} catch (err) {
		return res.status(500).send(err);
	}
};


