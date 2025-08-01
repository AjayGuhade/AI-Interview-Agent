const mongoose = require('mongoose');

const projectRecruitmentDriveSchema = new mongoose.Schema({
  CompanyID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  ProjectName: {
    type: String,
    required: true
  },
  TechnicalKeySkills: {
    type: [String],
    default: []
  },
  FunctionalKeySkills: {
    type: [String],
    default: []
  },
  EducationQualification: {
    type: String
  },
  YearsOfExp: {
    type: Number
  },
  ProjectManagerID: {
    type: Number
  },
  DifficultyLevel: {
    type: String,
    enum: ['easy', 'medium', 'hard']
  },
  EstimateStartDate: {
    type: Date
  },
  EstimateEndDate: {
    type: Date
  },
  Link: {
    type: String
  },
  Description: {
    type: String
  },
  // New fields
  Questions: {
    type: [String],
    default: []
  },
  DriveLink: {
    type: String
  },
  ResumeFolder: {
    type: String
  },
  ResumeFiles: [{
    name: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  WarningExceedCount: {
    type: Number,
    default: 5
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
projectRecruitmentDriveSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ProjectRecruitmentDrive', projectRecruitmentDriveSchema);