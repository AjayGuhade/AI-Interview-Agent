const express = require('express');
const CheatingLog = require('../databaseModels/cheatingLogModel');

const router = express.Router();

// POST: Create a cheating log
router.post('/', async (req, res) => {
  try {
    const log = new CheatingLog(req.body);
    await log.save();
    res.status(201).json({ message: 'Cheating log created', data: log });
  } catch (err) {
    res.status(400).json({ error: 'Validation failed', details: err.message });
  }
});

// GET: All cheating logs
router.get('/', async (req, res) => {
  try {
    const logs = await CheatingLog.find().populate('interviewId');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs', details: err.message });
  }
});

// GET: Logs by Interview ID
router.get('/interview/:id', async (req, res) => {
  try {
    const logs = await CheatingLog.find({ interviewId: req.params.id });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch interview logs', details: err.message });
  }
});

module.exports = router;
