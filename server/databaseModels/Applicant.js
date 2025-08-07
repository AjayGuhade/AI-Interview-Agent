const mongoose = require("mongoose");

const applicantSchema = new mongoose.Schema({
  ProjectRecruitmentDriveID: { type: String, required: true },
  MobileNumber: String,
  Email: String,
  FirstName: String,
  MiddleName: String,
  LastName: String,
  DOB: Date,
  Education: String,
  YearsOfExp: Number,
  Resume: String,
  InterviewStatus: {
    type: String,
    enum: ['Pending', 'Scheduled', 'Completed', 'Rejected', 'Cancelled'], // Add all valid statuses
    default: 'Pending'
  },
  MeetingLink: String,
  MeetingStartDate: Date,
  MeetingEndDate: Date,
  Referance: { type: String, enum: ['Naukari', 'CompanyURL', 'Other'] },
  IsApplicable: Boolean,
  LinkOpenedAt: { type: Date },

});

module.exports = mongoose.model("Applicant", applicantSchema);
