// db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_hiring_manager');
    console.log("✅ MongoDB connected");
    console.log(`📦 Using Database: ${conn.connection.name}`);  // ✅ Show connected DB name
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
