const express = require("express");
const router = express.Router();
const User = require("../databaseModels/User");

// Register User (Candidate or Manager)
router.post("/register", async (req, res) => {
  try {
    const { RoleID, FirstName, LastName, Email, Password } = req.body;

    // Validate required fields
    if (!RoleID || !FirstName || !Email || !Password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check for existing user
    const userExists = await User.findOne({ Email });
    if (userExists) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Auto-generate UserID: find max and increment
    const lastUser = await User.findOne().sort({ UserID: -1 });
    const newUserID = lastUser ? lastUser.UserID + 1 : 1;

    // Create new user
    const newUser = new User({
      UserID: newUserID,
      RoleID,
      FirstName,
      LastName,
      Email,
      Password
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login API
router.post("/login", async (req, res) => {
  try {
    const { Email, Password } = req.body;

    // Check if both fields are present
    if (!Email || !Password) {
      return res.status(400).json({ error: "Email and Password are required" });
    }

    // Find user by email
    const user = await User.findOne({ Email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare passwords (note: in production, use hashed passwords with bcrypt)
    if (user.Password !== Password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Update last login timestamp
    user.LastLogin = new Date();
    await user.save();

    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
