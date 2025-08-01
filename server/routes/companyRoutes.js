const express = require('express');
const router = express.Router();
const Company = require('../databaseModels/Company');

// Create a new company
router.post('/', async (req, res) => {
  try {
    const company = new Company(req.body);
    await company.save();
    res.status(201).json(company);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all companies
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one company by CompanyID
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findOne({ CompanyID: req.params.id });
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
