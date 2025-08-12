const express = require('express');
const router = express.Router();
const Applicant = require('../databaseModels/Applicant');

// GET /api/applicant/by-meeting/:meetingId
router.get('/by-meeting/:meetingId', async (req, res) => {
  try {
    const { meetingId } = req.params;
    const fullLink = `http://56.152.66.148.host.secureserver.net:8000/meet/${meetingId}`;

    const applicant = await Applicant.findOne({ MeetingLink: fullLink });

    if (!applicant) {
      return res.status(404).json({ message: 'Invalid or expired meeting link.' });
    }

    // Optional: log when they opened the link
    applicant.LinkOpenedAt = new Date();
    await applicant.save();

    res.json({
      message: 'Meeting link is valid.',
      applicant,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
