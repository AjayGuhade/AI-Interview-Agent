const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  InterviewID: {
    type: Number,
    required: true,
    unique: true
  },
  ApplicantID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Applicant',
    required: true
  },
  ProjectRecruitmentDriveID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProjectRecruitmentDrive',
    required: true
  },
  StartTime: {
    type: Date,
    required: true
  },
  EndTime: {
    type: Date
  },
  IsCompleted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Interview', interviewSchema);
