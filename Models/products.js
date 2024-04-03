const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  sellerid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  productType: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    //required: true,
  },
  image2: {
    type: String,
  },
  image3: {
    type: String,
  },
  image4: {
    type: String,
  },
  image5: {
    type: String,
  },
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
  },
  date: {
    type: Date
  },
  status: {
    type: String,
    enum: ['verified', 'unverified', 'rejected'],
    default: 'unverified',
  },
  reason: {
    type: String,
  },
});

module.exports = mongoose.model('Products', productSchema);
