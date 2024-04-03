const mongoose = require('mongoose');

const wishlistSchema = mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products',
    required: true,
  },
});

wishlistSchema.index({ userid: 1, productid: 1 }, { unique: true });

module.exports = mongoose.model('wishlist', wishlistSchema);
