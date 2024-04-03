const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
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
  quantity: {
    type: Number,
    default: 1,
  },
  price: {
    type: String
  },
  total: {
    type: String
  }

});

cartSchema.index({ userid: 1, productid: 1 }, { unique: true });

module.exports = mongoose.model('cart', cartSchema);
