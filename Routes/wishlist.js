const express = require("express");
const router = express.Router();
const Product = require("../Models/products");
const Wishlist = require("../Models/wishlist");

router.post('/add', async (req, res) => {
    try {
      const { userid, productid } = req.body;
      const existingWishlist = await Wishlist.findOne({ userid, productid });
      if (existingWishlist) {
        return res.status(202).json({ message: 'Product already in wishlist' });
      }
  
      const wishlist = new Wishlist({ userid, productid });
      await wishlist.save();
  
      res.status(201).json(wishlist);
    } catch (error) {
      console.error('Error inserting wishlist:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  router.delete('/delete/:userid/:productid', async (req, res) => {
    try {
      const { userid, productid } = req.params;
      await Wishlist.deleteOne({ userid, productid });
      res.status(200).json({ message: 'Product removed from wishlist' });
    } catch (error) {
      console.error('Error deleting product from wishlist:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.get('/wishlist/:userid/:productid', async (req, res) => {
    try {
      const { userid, productid } = req.params;
      const existingWishlist = await Wishlist.findOne({ userid, productid });
      res.status(200).json({ exists: !!existingWishlist });
    } catch (error) {
      console.error('Error fetching wishlist status:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.get('/getwishlistbyuserid/:userid', async (req, res) => {
    try {
      const { userid } = req.params;
      const wishlists = await Wishlist.find({ userid })
        .populate({ path: 'productid', model: 'Products' })
        .exec();
  
      const data = wishlists.map((wishlist) => ({
        productId: wishlist.productid._id,
        productDetails: wishlist.productid,
      
      }));
  
      res.status(200).json(data);
    } catch (error) {
      console.error('Error getting wishlists:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  module.exports = router; 