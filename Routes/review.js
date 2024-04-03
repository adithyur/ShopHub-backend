const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 
const Review = require('../Models/review');

router.post('/create', async (req, res) => {
  try {
    const { userid, productid, review, comments } = req.body;
    
    if (!mongoose.isValidObjectId(productid)) {
      return res.status(400).json({ message: 'Invalid productid' });
    }

    const existingReview = await Review.findOne({ userid, productid });

    if (existingReview) {
      existingReview.review = review;
      existingReview.comments = comments;
      const updatedReview = await existingReview.save();
      res.status(200).json(updatedReview);
    } else {
      const newReview = new Review({
        userid,
        productid,
        review,
        comments,
      });

      const savedReview = await newReview.save();
      res.status(201).json(savedReview);
    }
  } catch (error) {
    console.error('Error creating or updating review:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/getProductReviews/:productId', async (req, res) => {
    try {
      const { productId } = req.params;
  
      // Find all reviews for the given product ID
      const reviews = await Review.find({ productid: productId }).populate('userid').exec();
  
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/averagerating/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await Review.find({ productid: productId });

        let totalRating = 0;
        for (const review of reviews) {
            totalRating += review.review;
        }
        const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

        res.status(200).json({ averageRating });
    } catch (error) {
        console.error('Error calculating average rating:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


  router.get('/usercount/:productId', async (req, res) => {
    try {
      const { productId } = req.params;
  
      const reviews = await Review.find({ productid: productId });
  
      const userCount = new Set(reviews.map(review => review.userid)).size;
  
      res.status(200).json({ userCount });
    } catch (error) {
      console.error('Error counting users who rated the product:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.get('/all', async (req, res) => {
    try {
      const reviews = await Review.find().populate('userid');
      const reviewsWithUserInfo = reviews.map(review => ({
        _id: review._id,
        rating: review.review,
        comment: review.comments,
        user: review.userid.name 
      }));
      res.status(200).json(reviewsWithUserInfo);
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.get('/reviewproduct/:productId', async (req, res) => {
    try {
      const { productId } = req.params;
  
      const productReviews = await Review.find({ productid: productId }).populate('userid');
      const reviewsWithUserInfo =  productReviews.map(review => ({
        _id: review._id,
        rating: review.review,
        comment: review.comments,
        user: review.userid.name 
      }));
  
      res.status(200).json(reviewsWithUserInfo);
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.get('/eachstar/:productId', async (req, res) => {
    try {
      const { productId } = req.params;
  
      const reviews = await Review.find({ productid: productId });
      const starCounts = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      };
  
      for (const review of reviews) {
        starCounts[review.review]++;
      }
  
      res.status(200).json(starCounts);
    } catch (error) {
      console.error('Error calculating star counts:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.get('/display/:productId/:userId', async (req, res) => {
    try {
      const { productId, userId } = req.params;
  
      const existingReview = await Review.findOne({ productid: productId, userid: userId });
  
      res.status(200).json(existingReview);
    } catch (error) {
      console.error('Error fetching existing review:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  module.exports = router;
