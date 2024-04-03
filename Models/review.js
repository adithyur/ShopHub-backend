const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Products',
    required: true,
  },
  review: {
    type: Number,
  },
  comments: {
    type: String
  }

});

module.exports = mongoose.model('review', reviewSchema);