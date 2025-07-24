// models/User.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  
    userId: { type: String, default: uuidv4, unique: true }, // custom unique userId
  role: { type: String, enum: ["candidate", "admin", "company_Manager"], default: "candidate" },
  name: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date,
});

module.exports = mongoose.model("User", userSchema);
