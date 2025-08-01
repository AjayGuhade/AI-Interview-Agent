const mongoose = require('mongoose');

const questionAnswerSchema = new mongoose.Schema({
  QuestionAnswerID: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    required: true,
    unique: true
  },
  InterviewID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true
  },
  ApplicantID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Applicant',
    required: true
  },
  Question: {
    type: String,
    required: true
  },
  Answer: {
    type: String,
    required: true
  },
  FeedbackOnAnswer: {
    type: String
  },
  Score: {
    type: Number,
    min: 0,
    max: 10
  }
});

module.exports = mongoose.model('QuestionAnswer', questionAnswerSchema);
