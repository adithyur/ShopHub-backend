const express = require("express");
const router = express.Router();
const Cart = require("../Models/cart")
const Product = require("../Models/products");

router.post('/carts', async (req, res) => {
    try {
      const { userid, productid } = req.body;
      const existingCart = await Cart.findOne({ userid, productid });
      if (existingCart) {
        return res.status(202).json({ message: 'Product already in cart' });
      }

      else{

        const product = await Product.findById(productid);
        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }
        const price = product.price;
        const total = price;
        const cart = new Cart({ userid, productid, price, total });
        await cart.save();
        res.status(201).json(cart);

      }
    } catch (error) {
      console.error('Error inserting cart:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.get('/cart/:userid/:productid', async (req, res) => {
    try {
      const { userid, productid } = req.params;
      const existingCart = await Cart.findOne({ userid, productid });
      res.status(200).json({ exists: !!existingCart });
    } catch (error) {
      console.error('Error fetching cart status:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.delete('/cart/:userid/:productid', async (req, res) => {
    try {
      const { userid, productid } = req.params;
      await Cart.deleteOne({ userid, productid });
      res.status(200).json({ message: 'Product removed from cart' });
    } catch (error) {
      console.error('Error deleting product from cart:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.get('/getcartbyuserid/:userid', async (req, res) => {
    try {
      const { userid } = req.params;
      const carts = await Cart.find({ userid })
        .populate({ path: 'productid', model: 'Products' })
        .exec();
  
      const data = carts.map((cart) => ({
        productId: cart.productid._id,
        productDetails: cart.productid,
        quantity: cart.quantity,
        total: cart.total,
      
      }));
  
      res.status(200).json(data);
    } catch (error) {
      console.error('Error getting carts:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.get('/quantity/:userid/:productid', async (req, res) => {
    try {
      const { userid, productid } = req.params;
      const existingCart = await Cart.findOne({ userid, productid });
  
      if (!existingCart) {
        res.status(200).json({ exists: false, quantity: 0, total: 0 }); // Cart doesn't exist, return quantity and total as 0
      } else {
        res.status(200).json({
          exists: true,
          quantity: existingCart.quantity,
          total: existingCart.total, // Return the total from the cart
        });
      }
    } catch (error) {
      console.error('Error fetching cart status:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.get('/increment/:userid/:productid', async (req, res) => {
    try {
      const { userid, productid } = req.params;
    const cart = await Cart.findOne({ userid, productid });
    if (!cart) {
      return res.status(404).json({ message: 'Cart entry not found' });
    }

    cart.quantity += 1;
    const cleanedPrice = cart.price.replace(/[^0-9.]/g, '');
    const price = parseFloat(cleanedPrice);
    const newTotal = price * cart.quantity;
    const formattedTotal = newTotal.toLocaleString('en-IN'); // Adjust the locale as needed
    cart.total = formattedTotal;

    await cart.save();

    res.status(200).json({ message: 'Quantity incremented successfully', cart });
  } catch (error) {
    console.error('Error incrementing quantity:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/decrement/:userid/:productid', async (req, res) => {
  try {
    const { userid, productid } = req.params;
    const cart = await Cart.findOne({ userid, productid });

    if (!cart) {
      return res.status(404).json({ message: 'Cart entry not found' });
    }

    else{
    
    if (cart.quantity > 1) {
      cart.quantity -= 1;

      const cleanedPrice = cart.price.replace(/[^0-9.]/g, '');

      const price = parseFloat(cleanedPrice);

      const newTotal = price * cart.quantity;

      const formattedTotal = newTotal.toLocaleString('en-IN');

      cart.total = formattedTotal;

      await cart.save();

      res.status(200).json({ message: 'Quantity decremented successfully', cart });
    } else {
      res.status(400).json({ message: 'Minimum quantity reached' });
    }

    }
  } catch (error) {
    console.error('Error decrementing quantity:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
  
  module.exports = router;