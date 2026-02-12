const express = require('express');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// MongoDB URI and Database
const mongoURI = process.env.MONGO_URI || 'mongodb://mongo:27017';
const dbName = 'ai-interview';
const collectionName = 'users';

let db;

// Connect to MongoDB
MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    console.log('✅ Connected to MongoDB');
  })
  .catch(error => console.error('❌ MongoDB Connection Error:', error));

// Register API
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await db.collection(collectionName).findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection(collectionName).insertOne({ username, password: hashedPassword });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login API
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await db.collection(collectionName).findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
