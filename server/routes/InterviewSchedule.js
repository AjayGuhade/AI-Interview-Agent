const express = require('express');
const router = express.Router();
const Interview = require('../databaseModels/Interview');

// Create new interview
router.post('/', async (req, res) => {
  try {
    const interview = new Interview(req.body);
    await interview.save();
    res.status(201).json(interview);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create interview', details: err.message });
  }
});

// Get all interviews
router.get('/', async (req, res) => {
  try {
    const interviews = await Interview.find().populate('ApplicantID').populate('ProjectRecruitmentDriveID');
    res.status(200).json(interviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch interviews', details: err.message });
  }
});

// Get interview by ID
router.get('/:id', async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate('ApplicantID').populate('ProjectRecruitmentDriveID');
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    res.status(200).json(interview);
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving interview', details: err.message });
  }
});

module.exports = router;
