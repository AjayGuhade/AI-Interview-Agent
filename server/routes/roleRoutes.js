const express = require("express");
const router = express.Router();
const User = require("../databaseModels/roleModel");

// Function to get the next available UserID
const getNextUserID = async () => {
  const lastUser = await User.findOne().sort({ UserID: -1 }).lean();
  return lastUser && lastUser.UserID ? lastUser.UserID + 1 : 1001; // Start from 1001
};

// POST /api/users/register
router.post('/register', async (req, res) => {
  try {
    const data = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ Email: data.Email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = new User({
      ...data,
      UserID: await getNextUserID(), // Auto-generated
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

module.exports = router;
