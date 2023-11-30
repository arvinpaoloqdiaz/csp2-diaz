const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const bcrypt = require('bcrypt');
const auth = require("../auth");

// [SECTION] Register a User
module.exports.registerUser = async (req,res) => {
	try {
        // Check if the email already exists in the database
        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {
            // Email is already in use, send a response to the client
            return res.status(409).send(false);
        }
        // Email is not in use, proceed with user registration
        let newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            mobileNo: req.body.mobileNo,
            password: bcrypt.hashSync(req.body.password, 10)
        });

        // Save the new user to the database
        const savedUser = await newUser.save();

        // User registration successful, send a success response to the client
        return res.status(201).send(true);
    } catch (error) {
        // Handle errors
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
};

// [SECTION] Logs in a registered User. Creates a Cart for them
module.exports.loginUser = async (req, res) => {
  try {
    const registeredUser = await User.findOne({ email: req.body.email });

    if (registeredUser === null) {
      return res.status(401).send({access:undefined});
    }

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      registeredUser.password
    );

    if (isPasswordCorrect) {

      if (registeredUser.isAdmin == false){
        let userCart = await Cart.findOne({userId:registeredUser._id});
        if(!userCart){
          cartUser = new Cart({
              userId: registeredUser._id,
              cartProducts :[]
          });
          await cartUser.save();
        }
       };
      let message = `Login Successfully!`;

      return res.status(201).send({
        message: message,
        access: auth.createAccessToken(registeredUser),

      });

    } else {
      return res.status(401).send({access:undefined});
    }
  } catch (err) {
    return res.status(500).send(err);
  }
};

module.exports.getDetails = async (req,res) => {
	try {
        // if(req.params.userId !== req.user.id ){
        //     return res.status(409).send("The userDetails you are trying to get is not valid!");
        // }
        let user = await User.findById(req.user.id);
        let details = {
            userId: req.user.id,
            firstName:user.firstName,
            lastName:user.lastName,
            email: user.email,
            password: "",
            isAdmin: user.isAdmin,
            mobileNo: user.mobileNo,
            image:user.image
        }
        
        return res.status(201).send(details);
    } catch(err){
        res.status(500).send(err);
    }
};

module.exports.setAdmin = async (req,res) => {
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).send(false);
        }

        user.isAdmin = req.body.isAdmin;
        await user.save();
        res.status(200).send(true)
    } catch (err){
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

module.exports.getOrder = async (req,res) => {

    try{
        if (req.user.isAdmin) {
            return res.status(403).send("Action Forbidden, Non-Admin Only!");
        }
        const order = await Order.find({userId: req.user.id});
        const user = await User.findById(req.user.id);
        if(!order){
            console.log(req.user.id);
            return res.status(404).send("User not found!");
        }
        let newOrder = {
            name: `${user.firstName} ${user.lastName}`,
            orders: order.productOrder,
            total: order.total
        }
        res.status(200).send(order);
    }catch(err){
        res.status(500).send("Internal Server Error");
    }
};

module.exports.getAllOrder = async(req,res) => {
    try{

        const orders = await Order.find({});
        if(!orders){
            return res.status(404).send(orders)
        }
        let newOrders = orders.map(order => {
            return test = {
                orderId: order._id,
                userId:order.userId,
                productOrder:order.productOrder,
                status: order.status,
                total: order.total
            }
        });

        // const allOrders = [].concat(...orders.map(result => {userId:result.userId,orders.productOrder}));
        res.status(201).send(newOrders);
    } catch(err){
        res.status(500).send(err);
    }
};

module.exports.getCart = async (req,res) => {
    try{
        if (req.user.isAdmin) {
            return res.status(403).send("Action Forbidden, Non-Admin Only!");
        }
        const cart = await Cart.findOne({userId: req.user.id});
        if(!cart){
            console.log(req.user.id);
            return res.status(404).send("User not found!");
        }
        let newCart = {
            cartProducts:cart.cartProducts,
            total:cart.total
        }
        res.status(200).send(newCart);
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};

module.exports.resetPassword = async (req, res) => {
  const newPassword = req.body.newPassword;
  const oldPassword = req.body.oldPassword;
  const userId = req.user.id; // Assuming user ID is extracted from the authorized JWT token

  try {
    const saltRounds = 10;
    const checkPassword = await User.findById(userId);
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    const isPasswordCorrect = bcrypt.compareSync(oldPassword,checkPassword.password);
    if(!isPasswordCorrect){
        return res.status(401).send(false);
    }    

    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    return res.status(200).send(true);
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ error: 'Internal server error'});
  }
};

module.exports.createOrder = async (req,res) => {
    try {
            // Checks if current user is a regular user
            checkAdmin(req.user.isAdmin,res);

            // Retrieves the Order based on the userId.
            let userOrder = await Order.findOne({ userId: req.user.id, status:"pending" });
           
            // If there is no match within the order database creates a new Order Model, Otherwise, continue.
            if (!userOrder) {
                userOrder = new Order({
                    userId: req.user.id,
                    productOrder: [] // Initialize productOrder array
                });
            };
            // Check if quantity is valid 
            if(req.body.quantity <= 0){
                return res.status(409).send({message:"Invalid quantity"});
            }
            // Retrieves the Cart of the user and stores in newCart variable.
            let newCart = await Cart.findOne({ userId: req.user.id });

            // If there is no cart, it will return a 404 message of No Cart
            if (!newCart) {
               return res.status(404).send({message:"No Cart content!"});
            };

            // Gets the index of the object that matches the productId in req.body. The array is the cartProducts.
            const orderIndex = newCart.cartProducts.findIndex(
             (product) => product.productId === req.body.productId
             );

            // check if product is inside the cart
            if(orderIndex == -1){
                return res.status(404).send({message:"Product not found in cart!"});
            }

            // stores the product object inside currentProduct
            let currentProduct = newCart.cartProducts[orderIndex];

            // stores the product in product variable by matching the product id inside currentproduct
            let product = await Product.findById(currentProduct.productId);
            // Check to see if product is out of stock
            if(product.isActive == false && product.stocks == 0){
                return res.status(404).send({message:"Product is now out of stock!"});
            }            
            // Check to see if product isActive is true
            if(product.isActive == false){
                return res.status(409).send({message:"Item is inactive"});
            }
           // Checks if there is enough stocks to checkout in cart
            if(currentProduct.quantity < req.body.quantity){
                return res.status(409).send({message:"Not enough stocks in cart!"});
            }

            // Subtracts the quantity that is checked out to the quantity in the cart
            currentProduct.quantity -= req.body.quantity;

            // check if there is enough stocks to checkout in inventory
            if (product.stocks < req.body.quantity) {
                return res.status(409).send({message:"Not enough stocks in inventory!"});
            }

            // Subtracts the quantity that is checked out to the quantity in the inventory (stocks)
            let stocks = product.stocks;
            stocks -= req.body.quantity;

            if (stocks == 0){
                product.isActive = false;
            }

            product.stocks = stocks;
            await product.save(); 
            
            // Creates the object to be pushed in the array.
            const newProductOrder = {
                productId: currentProduct.productId,
                productName: currentProduct.productName,
                price: currentProduct.price,
                quantity: req.body.quantity,
                totalAmount: req.body.quantity * currentProduct.price
            };
            // subtracts the subTotal checked out to the cartProduct total and subTotal.
            newCart.total -= newProductOrder.totalAmount ;
            newCart.cartProducts[orderIndex].subTotal -= newProductOrder.totalAmount;

            // If product in cart has 0 stocks, remove the product in cart. subtract to Total of cartProducts
            if(currentProduct.quantity == 0){
                newCart.total -= currentProduct.subTotal;
                newCart.cartProducts.splice(orderIndex,1);
            }
            

            // Saves the newCart
            await newCart.save();

            // check if cartProducts is empty , if empty delete newCart
            // Pushes the created object to the array in the database and adds the totalAmount to the grand total of the checkout
            userOrder.productOrder.push(newProductOrder);
            userOrder.total += newProductOrder.totalAmount;
            
            // Saves the userOrder
            await userOrder.save();
            return res.status(200).send(
                {
                    message:"Order Placed!",
                    orders:userOrder.productOrder,
                    total:userOrder.total,
                    status:userOrder.status
                }
            );


        } catch (error) {
            console.error(error);
            return res.status(500).send("Internal Server Error");
        }
   
};

module.exports.updateProfile = async (req,res) => {
    try{
        let newProfile = {
            firstName: req.body.firstName,
            lastName:req.body.lastName,
            email: req.body.email,
            mobileNo: req.body.mobileNo,
            image: req.body.image
        }
        let user = await User.findByIdAndUpdate(req.user.id,newProfile);
        
        if (!user){
            return res.status(404).send("User does not exists");
        }
        let updatedUser = await User.findById(req.user.id);
        let updatedUserDetails = {
            userId:updatedUser._id,
            firstName: updatedUser.firstName,
            lastName:updatedUser.lastName,
            email: updatedUser.email,
            password: "",
            mobileNo: updatedUser.mobileNo,
            image: updatedUser.image
        }
        res.status(201).send(true);
    } catch(err){
        return res.status(500).send(err);
    }
}

module.exports.getUserDetails = async(req,res) => {
    let user = await User.findById(req.params.userId);
    let details = {
        userId: req.user.id,
        firstName:user.firstName,
        lastName:user.lastName,
        email: user.email,
        password: "",
        isAdmin: user.isAdmin,
        mobileNo: user.mobileNo,
        image:user.image
    }
    console.log(details)
    return res.status(201).send(details);
}

module.exports.getAllUsers = async (req,res) => {
    let user = await User.find({});
    return res.send(user);
}


const checkAdmin = (isAdmin,res) => {
    if (isAdmin) {
        return res.status(403).send("Action Forbidden, Non-Admin Only!");
    };
};