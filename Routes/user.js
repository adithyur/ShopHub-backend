const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const User = require('../Models/user');

// Middleware to validate ObjectId
const isValidObjectId = mongoose.isValidObjectId;

router.get('/userdetail/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Use your User model to find the user by their ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the user details as JSON
    res.status(200).json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post("/reguser", async (req, res) => {
  try {
    const { name, email, password, trade } = req.body;

    let role = "user";
    if (trade === "sell") {
      role = "seller";
    }

    const user = new User({ name, email, password, trade, role });

    await user.save();

    res.status(201).json(user);
  } catch (error) {
    console.error("Error inserting user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(500).json({error: "Email mismatch!"});
    } else {
      const matched = await user.comparePassword(password);
      if (!matched) return res.status(401).json({error: "Password mismatch!"});
      if (matched) return res.json(user);
    }
  } catch (error) {
    console.error('Server Error', error);
    return res.status(500).json({error: " server error "});
  }
});
    router.get('/getdetail/:userid',async(req,res)=>{
      try{
          const {userid} =req.params;
          console.log(userid)
          const user=await User.findById(userid)
          if(user){
            ///console.log("data : ")
            console.log("matched")
            res.status(201).json(user);
          }
          else{
            console.log("invalid")
          }
      }
      catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ message: error });
      }
    })

    router.get('/userdetail/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
        console.log("user id : ",userId)
        // Use your User model to find the user by their ID
        const user = await User.findById(userId);
    
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        // Return the user details as JSON
        res.status(200).json(user);
      } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });

    router.get('/countUsers', async (req, res) => {
      try {
        const userCount = await User.countDocuments({ trade: 'buy' });
        res.json({ count: userCount });
      } catch (error) {
        console.error('Error counting users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });

    router.get('/countSeller', async (req, res) => {
      try {
        const verifierCount = await User.countDocuments({ trade: 'sell' });
        res.json({ count: verifierCount });
      } catch (error) {
        console.error('Error counting verifier:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });

    router.post('/viewuser', async (req, res) => {
      try {
        const roleuser = await User.find({ role: 'user' });
        res.json(roleuser);
      } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    router.delete('/delete/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
    
        const deletedUser = await User.findByIdAndDelete(userId);
    
        if (deletedUser) {
          res.status(200).json({ message: 'User deleted successfully' });
        } else {
          res.status(404).json({ message: 'User not found' });
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });

    router.post('/viewseller', async (req, res) => {
      try {
        const role = await User.find({ trade: 'sell' });
        res.json(role);
      } catch (error) {
        console.error('Error fetching verifier:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    router.get('/getname/:userid', async (req, res) => {
      try {
        const { userid } = req.params;
        const user = await User.findById(userid);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        const username = user.name;
        const mailid =  user.email;
        res.status(200).json({ username , mailid});
      } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ message: error });
      }
    });


module.exports = router;
