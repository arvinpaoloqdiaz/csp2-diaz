const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const bcrypt = require('bcrypt');
const auth = require("../auth");

// [SECTION] Create Product (ADMIN)
module.exports.createProduct = async (req, res) => {
    try {
        // Check if stocks is valid 
        if(req.body.stocks < 0){
            return res.status(409).send("Invalid stocks");
        }
        // Check if price is valid 
        if(req.body.price <= 0){
            return res.status(409).send("Invalid price");
        }
        // Check if the product exists
        const existingProduct = await Product.findOne({ productName: req.body.productName });

        if (existingProduct) {
            // Product already exists, send a response to the client
            return res.status(409).send(false);
        }
        let newProduct = new Product(
            {
                productName: req.body.productName,
                description: req.body.description,
                price: req.body.price,
                stocks: req.body.stocks,
                image: req.body.image
            }
        );

        // Save the new user to the database
        const savedProduct = await newProduct.save();

        // User registration successful, send a success response to the client
        return res.status(200).send(true);
    } catch (error) {
        // Handle errors
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
};

// [SECTION] Get All Products (ANY)
module.exports.getAllProducts = (req, res) => {
    return Product.find({})
    .then( result => {
        return res.status(200).send(result)
    })
};

// [SECTION] Get All Active Products (ANY)
module.exports.getAllActiveProducts = (req,res) => {
    return Product.find({ isActive: true }).then(result => {
        return res.status(200).send(result);
    })
};

// [SECTION] Get Single Product
module.exports.getProduct = (req,res) => {
    return Product.find({ _id: req.params.productId }).then(result => {
        return res.status(200).send(result);
    })
};

module.exports.updateProduct = async (req,res) => {
    // Check if price is valid 
    if(req.body.price <= 0){
        return res.status(409).send({message:"Invalid price"});
    }
    // Check if stocks is valid 
    if(req.body.stocks <= 0){
        return res.status(409).send({message:"Invalid stocks"});
    }
    let updatedProduct = {
        productName : req.body.productName,
        description : req.body.description,
        price : req.body.price,
        stocks: req.body.stocks,
        image: req.body.image
    };
    let product = await Product.findByIdAndUpdate(req.params.productId, updatedProduct);
    if (!product){
        return res.status(404).send({message:false});
    }
    return res.status(201).send({message:true});

};

module.exports.archiveProduct = (req,res) => {
    return Product.findByIdAndUpdate(req.params.productId, {isActive:false})
    .then((result, err) => {

        //course archived successfully
        if(err){
            return res.status(500).send(false)

        // failed
        } else {
            return res.send(true)            
        }
    })
    .catch(err => res.status(500).send(err))
}

module.exports.activateProduct = (req,res) => {
    return Product.findByIdAndUpdate(req.params.productId, {isActive:true})
    .then((result, err) => {

        //course archived successfully
        if(err){
            return res.status(500).send(err)

        // failed
        } else {
            return res.send(true)
        }
    })
    .catch(err => res.status(500).send(err))
}
module.exports.searchByName = async (req,res) => {
    try{
        let product = await Product.find({ productName: { $regex: req.body.productName, $options: 'i' },isActive:true });
        res.status(200).send(product);
    } catch(err){
        res.status(500).send(err);
    }
};

module.exports.searchByPrice = async (req, res) => {
  const { minPrice, maxPrice } = req.body;

  try {
    const product = await Product.find({
      price: { $gte: minPrice, $lte: maxPrice },
      isActive:true
    });

    return res.status(200).send(product);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

