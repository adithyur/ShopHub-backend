const express = require("express");
const router = express.Router();
const User = require('../Models/user');
const Order = require('../Models/order');
const Products = require('../Models/products');
const Transaction = require('../Models/transaction');
//const moment = require('moment');

router.post('/place', async (req, res) => {
    try {
      const ordersToPlace = req.body;
  
      const placedOrUpdatedOrders = [];
      for (const orderData of ordersToPlace) {
        const { userid, productid, sellerid, quantity, price, total } = orderData;
  
        const existingOrder = await Order.findOne({
          userid,
          productid,
          sellerid,
          status: 'cart',
        });
  
        if (existingOrder) {
  
          existingOrder.quantity = quantity;
          existingOrder.price = price;
          existingOrder.total = total;
  
          const updatedOrder = await existingOrder.save();
          placedOrUpdatedOrders.push(updatedOrder);
        } else {
          
          const newOrder = new Order({
            userid,
            productid,
            sellerid,
            quantity,
            price,
            total,
            status: 'cart',
          });
          await newOrder.save();
          placedOrUpdatedOrders.push(newOrder);
        }
      }
  
      res.status(200).json(placedOrUpdatedOrders);
    } catch (error) {
      console.error('Error placing or updating orders:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.get('/user/:userid', async (req, res) => {
    try {
      const { userid } = req.params;
      const order = await Order.find({ userid })
        .populate({ path: 'productid', model: 'Products' })
        .exec();
  
      const data = order.map((order) => ({
        productId: order.productid._id,
        productDetails: order.productid,
        total: order.total,
        quantity: order.quantity,
        orderid: order._id,
      }));
  
      res.status(200).json(data);
    } catch (error) {
      console.error('Error getting orders:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


  router.post('/getorderbyuserid/:userid', async (req, res) => {
    try {
      const { userid } = req.params;
      const viewOrders = await Order.find({ status: { $ne: 'cart' }, userid })
        .populate({ path: 'productid', model: 'Products' })
        .exec();
  
      const data = await Promise.all(viewOrders.map(async (order) => {
        
        const transaction = await Transaction.findOne({ orderid: order._id });
        
        return {
          orderId: order._id,
          product: {
            productId: order.productid._id,
            productName: order.productid.productName,
            image: order.productid.image,
          },
          status: order.status,
          total: order.total,
          date: order.deliverydate,
          payment: transaction ? transaction.mode : '',
        };
      }));
  
      res.json(data);
    } catch (error) {
      console.error('Error fetching order history:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/userdetail/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
  
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.delete('/delete/:userid', async (req, res) => {
    try {
      const { userid } = req.params;
      const { status } = req.query;
  
      await Order.deleteMany({ userid, status });
  
      res.status(200).json({ message: `Orders with status "${status}" deleted successfully.` });
    } catch (error) {
      console.error('Error deleting orders:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.get('/getOrderDetails/:userid', async (req, res) => {
    try {
      const { userid } = req.params;
      const status = 'cart';
      //console.log('user id : ',userid);
      const order = await Order.findOne({ userid, status }).select('_id productid address');
  
      if (order) {
        //console.log("order : ",order)
        const { _id: orderId, productid: productId, address } = order;
        res.status(200).json({ orderId, productId, address });
      } else {
        res.status(404).json({ message: 'Order not found' });
      }
    } catch (error) {
      console.error('Error getting order details:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.post('/profile/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params;
      const { name, mobile1, pincode, place, address, city, state, landmark, mobile2 } = req.body;
  
      const updatedProfile = await Order.findOneAndUpdate(
        { _id: orderId },
        { name, mobile1, pincode, place, address, city, state, landmark, mobile2 },
        { new: true }
      );
  
      if (updatedProfile) {
        
        res.status(200).json(updatedProfile);
      } else {
        res.status(404).json({ message: "Profile not found" });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.get('/dsplywaiting/:userid', async (req, res) => {
    try {
      const { userid } = req.params;
  
      const orders = await Order.find({ userid, status: 'cart' })
        .populate({ path: 'productid', model: 'Products' })
        .exec();
  
      const orderDetails = orders.map((order) => ({
        productId: order.productid._id,
        productDetails: order.productid,
        total: order.total,
        price: order.price,
        quantity: order.quantity,
        orderid: order._id,
      }));
  
      res.status(200).json(orderDetails);
    } catch (error) {
      console.error('Error getting orders:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.put('/unconfirmOrder/:orderid', async (req, res) => {
    try {
      const { orderid } = req.params;
  
      const updatedOrder = await Order.findByIdAndUpdate(
        orderid,
        {
          status: 'pending',
          orderdate: Date.now(),
          deliverydate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        },
        { new: true }
      );
  
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      updatedOrder.transactionid = req.body.transactionId;
  
      await updatedOrder.save();
  
      res.status(200).json(updatedOrder);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.put('/confirmOrders/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params;
      //console.log('order id : ',orderId)
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: 'confirmed' }, { new: true });
  
      if (!updatedOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      res.status(200).json(updatedOrder);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/getOrderDetails/:orderid', async (req, res) => {
    try {
      const { orderid } = req.params;
  
      const orderDetails = await Order.findById(orderid)
  
      if (!orderDetails) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      res.status(200).json(orderDetails);
    } catch (error) {
      console.error('Error fetching order details:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.get('/countOrders', async (req, res) => {
    try {
      const orderCount = await Order.countDocuments({ status: 'Delivered' });
      res.json({ count: orderCount });
    } catch (error) {
      console.error('Error counting order:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.post('/viewOrder', async (req, res) => {
    try {
      const viewOrders = await Order.find({ status: { $ne: 'cart' } })
        .populate({ path: 'productid', model: 'Products' })
        .exec();
  
      const data = viewOrders.map((order) => ({
        orderId: order._id,
        product: {
          productId: order.productid._id,
          productName: order.productid.productName,
          productCategory: order.productid.category,
          image: order.productid.image,
          sellerid: order.productid.sellerid
        },
        orderid: order._id,
        userid: order.userid,
        productid: order.productid,
        sellerid: order.sellerid,
        status: order.status,
        total: order.total,
        quantity: order.quantity,
        place:order.place,
      }));
  
      res.json(data);
    } catch (error) {
      console.error('Error fetching order history:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.put('/statusUpdate/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
  
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { $set: { status } },
        { new: true }
      );
  
      if (updatedOrder) {
        res.status(200).json(updatedOrder);
      } else {
        res.status(404).json({ message: 'Order not found' });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.post('/viewveriOrder', async (req, res) => {
    try {
      const viewOrders = await Order.find({ status: { $ne: 'delivered' } })
        .populate({ path: 'productid', model: 'Products' })
        .exec();
  
      const data = viewOrders.map((order) => ({
        orderId: order._id,
        product: {
          productId: order.productid._id,
          productName: order.productid.productName,
          productCategory: order.productid.category,
          image: order.productid.image,
          sellerid: order.productid.sellerid
        },
        userid: order.userid,
        status: order.status,
        total: order.total,
        quantity: order.quantity,
        place: order.place,
      }));
  
      res.json(data);
    } catch (error) {
      console.error('Error fetching order history:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/orders/:sellerId', async (req, res) => {
    try {
      const { sellerId } = req.params;
  
      const orders = await Order.find({ sellerid: sellerId });
  
      res.status(200).json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/orderdis/:sellerId', async (req, res) => {
    try {
        const { sellerId } = req.params;

        const conditions = {
            sellerid: sellerId,
            status: { $nin: ['delivered', 'pending', 'unconfirmed'] }
        };

        const orders = await Order.find(conditions);
        //console.log('orders : ',orders)
        res.json({ orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

  router.get('/orderdetails/:orderId', async (req, res) => {
    try {
      
      const { orderId } = req.params;
      //console.log('order id: ',orderId);
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      const product = await Products.findById(order.productid);
      //console.log('product : ',product);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      const user = await User.findById(order.userid);
      //console.log('user id : ',order.userid);
      //console.log('user : ',user)

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Fetch transaction details
      const transaction = await Transaction.findOne({ orderid: orderId });
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
  
      // Prepare response
      const orderDetails = {
        username: user.name,
        address: order.address,
        productName: product.productName,
        image: product.image,
        price: product.price,
        quantity: order.quantity,
        city: order.city,
        mobile: order.mobile1,
        orderstatus: order.status,
        total: order.total,
        deliveryDate: order.deliverydate,
        transactionMode: transaction.mode,
        payementstatus: transaction.status
      };
  
      res.status(200).json(orderDetails);
    } catch (error) {
      console.error('Error fetching order details:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.get('/countCompletedOrders', async (req, res) => {
    try {
      const orderCount = await Order.countDocuments({ status: 'delivered' });
      res.json({ count: orderCount });
    } catch (error) {
      console.error('Error counting order:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.get('/countCompletedOrders/:sellerId', async (req, res) => {
    try {
        const { sellerId } = req.params;
        //console.log("seller id : ",sellerId)
        const orderCount = await Order.countDocuments({ sellerid: sellerId, status: 'delivered' });
        //console.log("count : ",orderCount)
        res.json({ count: orderCount });
    } catch (error) {
        console.error('Error counting orders:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

  router.get('/countOrdersLastWeek', async (req, res) => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
      const count = await Order.countDocuments({
        status: 'delivered',
        orderdate: { $gte: sevenDaysAgo }
      });
      //console.log("order : ",count)
      res.json({ count });
    } catch (error) {
      console.error('Error counting orders:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  router.get('/neworders/:sellerId', async (req, res) => {
    const { sellerId } = req.params; 
    //console.log("seller id : ",sellerId)
    try {
      const confirmedOrdersCount = await Order.countDocuments({ sellerid: sellerId, status: 'confirmed' });
      res.json({ count: confirmedOrdersCount });
    } catch (error) {
      console.error('Error counting orders:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/Shipping/:sellerId', async (req, res) => {
    const { sellerId } = req.params;
  
    try {
      const excludedStatus = ['delivered', 'pending', 'unconfirmed'];
      const ordersCount = await Order.countDocuments({ sellerid: sellerId, status: { $nin: excludedStatus } });
      res.json({ count: ordersCount });
    } catch (error) {
      console.error('Error counting orders:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/top-sale-products', async (req, res) => {
    try {
      // Aggregate orders to count the sales of each product
      const topSaleProducts = await Order.aggregate([
        {
          $group: {
            _id: '$productid',
            count: { $sum: 1 } // Count the number of orders for each product
          }
        },
        {
          $match: {
            count: { $gte: 2 } // Filter products sold 5 or more times
          }
        },
        {
          $lookup: {
            from: 'products', // Collection name of products
            localField: '_id',
            foreignField: '_id',
            as: 'product' // Attach product details to each sale
          }
        },
        {
          $unwind: '$product'
        },
        {
          $project: {
            _id: '$product._id',
            image: '$product.image',
            productName: '$product.productName',
            price: '$product.price',
            productType: '$product.productType',
            category: '$product.category',
            brand: '$product.brand',
            description: '$product.description',
            quantitySold: '$count',
            offer: '$product.offer',
          }
        }
      ]);
  
      res.json(topSaleProducts);
    } catch (error) {
      console.error('Error fetching top sale products:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
module.exports = router;