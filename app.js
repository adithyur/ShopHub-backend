const express = require("express");
const cors = require("cors");
const { connectToMongoDB } = require("./Db/index");

const userRouter = require("./Routes/user");
const productRouter = require("./Routes/products");
const reviewRouter = require("./Routes/review");
const wishlistRouter = require("./Routes/wishlist");
const cartRouter = require("./Routes/cart");
const orderRouter = require("./Routes/order");
const transactionRouter = require("./Routes/transaction");
const profileRouter = require('./Routes/profile');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Call the connectToMongoDB function to establish the MongoDB connection
connectToMongoDB();

// Routes
app.use("/api/user", userRouter);
app.use("/api/products", productRouter);
app.use("/api/review", reviewRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/transaction", transactionRouter);
app.use("/api/profile", profileRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
