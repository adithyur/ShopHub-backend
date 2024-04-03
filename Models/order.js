const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
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
  sellerid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  },
  sum: {
    type: String
  },
  
  status: {
    type: String,
    default: 'waiting for confirmation'
  },
  transactionid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'transaction'
  },
  orderdate:{
    type: Date
  },

  deliverydate: {
    type: Date
  },

  name: {
        type: String
    },
    mobile1: {
        type: String
    },
    pincode: {
        type: String
    },
    place: {
        type: String
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    landmark: {
        type: String
    },
    mobile2: {
        type: String
    },
    payment: {
      type: String
    }
});

orderSchema.index({ userid: 1, productid: 1 }, { unique: false });

module.exports = mongoose.model('order', orderSchema);