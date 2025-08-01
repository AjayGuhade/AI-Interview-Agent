const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  UserID: {
    type: String,
    unique: true,
    required: false // optional now since we auto-generate it
  },
  RoleID: {
    type: String,
    enum: ['candidate', 'manager', 'admin'], // optional validation
    required: true
  }
  ,
  FirstName: {
    type: String,
    required: true
  },
  LastName: {
    type: String
  },
  Email: {
    type: String,
    required: true,
    unique: true
  },
  Password: {
    type: String,
    required: true
  },
  CreatedDate: {
    type: Date,
    default: Date.now
  },
  LastLogin: {
    type: Date
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
