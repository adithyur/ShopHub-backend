const express = require("express");
const router = express.Router();
const cloudinary = require('../utils/cloudinary');
const upload = require('../middleware/multer');

const User = require('../Models/user');
const Products = require('../Models/products');


router.post('/addproduct', upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
  { name: 'image5', maxCount: 1 }
]),
  async (req, res) => {
    try {
      const {
        sellerid,
        productName,
        price,
        productType,
        category,
        brand,
        description,
        quantity
      } = req.body;

      console.log('data : ', req.body);
      console.log('data : ', req.files);

      if (!req.files || !req.files.image1 || !req.files.image2 || !req.files.image3 || !req.files.image4 || !req.files.image5) {
        return res.status(400).json({ message: 'All four images are required.' });
      }

      const { image1, image2, image3, image4, image5 } = req.files;

      const uploadImage = async (image) => {
        const result = await cloudinary.uploader.upload(image[0].path);
        return result.secure_url;
      };

      const uploadPromises = [image1, image2, image3, image4, image5].map(uploadImage);

      const [uploadedImage1, uploadedImage2, uploadedImage3, uploadedImage4, uploadedImage5] = await Promise.all(uploadPromises);

      const product = new Products({
        sellerid,
        productName,
        price,
        productType,
        category,
        brand,
        image: uploadedImage1,
        image2: uploadedImage2,
        image3: uploadedImage3,
        image4: uploadedImage4,
        image5: uploadedImage5,
        description,
        quantity
      });

      await product.save();
      console.log("product added");
      res.status(201).json(product);
    } catch (error) {
      console.error('Error inserting product:', error);
      res.status(500).json({ message: error });
    }
  }
);

router.put('/updateproduct/:productId', upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
  { name: 'image5', maxCount: 1 }
]),
async (req, res) => {
  try {
    const { productId } = req.params;
    const {

      productName,
      price,
      productType,
      category,
      brand,
      description,
      quantity
    } = req.body;

    // Check if at least one image field is provided
    if (!req.files ) {
      return res.status(400).json({ message: 'At least one image is required for update.' });
    }

    const { image1, image2, image3, image4, image5 } = req.files;

    // Fetch the existing product
    const existingProduct = await Products.findById(productId);

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    
    existingProduct.productName = productName;
    existingProduct.price = price;
    existingProduct.productType = productType;
    existingProduct.category = category;
    existingProduct.brand = brand;
    existingProduct.description = description;
    existingProduct.quantity = quantity;

    if (image1) existingProduct.image = image1[0].path;
    if (image2) existingProduct.image2 = image2[0].path;
    if (image3) existingProduct.image3 = image3[0].path;
    if (image4) existingProduct.image4 = image4[0].path;
    if (image5) existingProduct.image5 = image5[0].path;

    await existingProduct.save();
    res.status(200).json(existingProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: error });
  }
}
);


router.get('/getproduct', async (req, res) => {
  try {
    const product = await Products.find();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ message: error });
  }
});

router.post('/veproducts', async (req, res) => {
  try {
    const verifiedProducts = await Products.find({ status: 'verified' });
    res.json(verifiedProducts);
  } catch (error) {
    console.error('Error fetching verified products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/display/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    console.log("product id : ",productId)
    const product = await Products.findById(productId);
    const seller = await User.findById(product.sellerid);
    const productDataWithSeller = {
      ...product.toObject(),
      sellerName: seller.name,
    };

    res.status(200).json(productDataWithSeller);
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ message: error });
  }
});

router.put('/updateQuantityminus/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // Parse quantity as an integer
    const parsedQuantity = parseInt(quantity);
console.log('quantity : ',quantity);
    // Find the product by ID
    const product = await Products.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.quantity < parsedQuantity) {
      return res.status(400).json({ message: 'Not enough available quantity' });
    }

    product.quantity -=quantity;
  
    await product.save();

    return res.status(200).json({ message: 'Quantity updated successfully', updatedProduct: product });
  } catch (error) {
    console.error('Error updating quantity:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/searchdata/:searchdata',async(req,res)=>{
  const {searchdata}=req.params 
  const regex = new RegExp(searchdata, 'i');

    const product = await Products.find({
      $or: [
        { productName: { $regex: regex } },
        { brand: { $regex: regex } },
        { category: { $regex: regex } },
        { description: { $regex: regex } },
      
      ],
    });
    res.json(product);
})

router.get('/getcategory/:category',async(req,res)=>{
  try{
      const{category}=req.params
      const product=await Products.find({category, status: 'verified'})
      res.status(201).json(product);
  }
  catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ message: error });
  }
})

router.get('/gettype/:productType',async(req,res)=>{
  try{
      const{productType}=req.params
      const product=await Products.find({productType, status: 'verified'})
      res.status(201).json(product);
  }
  catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ message: error });
  }
})

router.get('/countProducts', async (req, res) => {
  try {
    const productCount = await Products.countDocuments({ status: 'verified' });
    res.json({ count: productCount });
  } catch (error) {
    console.error('Error counting users:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/countProducts/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const productCount = await Products.countDocuments({ sellerid: sellerId, status: 'verified' });
    res.json({ count: productCount });
  } catch (error) {
    console.error('Error counting products:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.put('/unupdate/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const updatedProductData = req.body;

    const updatedProduct = await Products.findByIdAndUpdate(
      productId,
      { $set: updatedProductData },
      { new: true }
    );

    if (updatedProduct) {
      res.status(200).json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/getproductbyuserid/:sellerid',async(req,res)=>{
  try{
      const{sellerid}=req.params;
      const product=await Products.find({sellerid})
      res.status(201).json(product);
  }
  catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ message: error });
  }
})

router.put('/updateStatus/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Products.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.status = 'verified';
    product.date = Date.now();

    await product.save();

    return res.status(200).json({ message: 'Product status updated to verified', updatedProduct: product });
  } catch (error) {
    console.error('Error updating product status:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.delete('/deleteproduct/:productid', async (req, res) => {
  try {
    const { productid } = req.params;
    await Products.findByIdAndDelete(productid);
    res.status(200).json({ message: 'Product removed' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/latestProducts', async (req, res) => {
  try {
    // Calculate the date 7 days ago
    const lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);

    // Find products created in the last 7 days
    const latestProducts = await Products.find({ date: { $gte: lastWeekDate } })
      .sort({ date: -1 }) // Sort by date in descending order
      .limit(10); // Limit the number of products to be fetched, adjust as needed

    res.status(200).json({ latestProducts });
  } catch (error) {
    console.error('Error fetching latest products:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
