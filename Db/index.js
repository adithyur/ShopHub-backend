const mongoose = require('mongoose');

// Function to establish MongoDB connection
function connectToMongoDB() {
  const uri = "mongodb+srv://kl61altoboy:yGwiQ4vmdeq1HseO@shophub-db.zcciruq.mongodb.net/ShopHub?retryWrites=true&w=majority&appName=ShopHub-db";
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
  db.once("open", () => {
    console.log("Connected to MongoDB");
  });
}

// Export the function for use in other files
module.exports = {
  connectToMongoDB
};
