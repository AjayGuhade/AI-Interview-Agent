const express = require('express');
const router = express.Router();
// const QuestionAnswer = require('../databaseModels/QuestionAnswer');
(async () => {
  const { Number } = await import('three/examples/jsm/transpiler/AST.js');
  // use Number here
})();

// POST: Create a new QuestionAnswer
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const qa = new QuestionAnswer(data);
    await qa.save();
    res.status(201).json({ message: 'QuestionAnswer created', qa });
  } catch (error) {
    console.error('Error creating QuestionAnswer:', error);
    res.status(500).json({ error: 'Failed to create QuestionAnswer', details: error.message });
  }
});

// GET: Get all QuestionAnswers
router.get('/', async (req, res) => {
  try {
    const all = await QuestionAnswer.find().populate('InterviewID').populate('ApplicantID');
    res.status(200).json(all);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get QuestionAnswers', details: error.message });
  }
});

// GET: Get by QuestionAnswerID
router.get('/:id', async (req, res) => {
  try {
    const qa = await QuestionAnswer.findOne({ QuestionAnswerID: req.params.id });
    if (!qa) return res.status(404).json({ error: 'Not found' });
    res.status(200).json(qa);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch QA', details: error.message });
  }
});

module.exports = router;
