const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  CompanyID: {
    type: Number,
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: true
  },
  companyEmail: {
    type: String,
    required: true
  },
  address: {
    line1: String,
    line2: String
  },
  location: {
    type: String
  },
  websiteUrl: {
    type: String
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

const Company = mongoose.model('Company', companySchema);
module.exports = Company;
