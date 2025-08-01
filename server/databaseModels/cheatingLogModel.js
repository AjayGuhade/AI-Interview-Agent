const mongoose = require('mongoose');

const cheatingLogSchema = new mongoose.Schema({
  cheatingLogId: {
    type: String,
    required: true,
    unique: true
  },
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true
  },
  type: {
    type: String,
    enum: ['face-not-visible', 'multiple-faces', 'tab-switch', 'copy-paste'],
    required: true
  },
  screenshotUrl: {
    type: String
  },
  actionTaken: {
    type: String,
    enum: ['warned', 'terminated'],
    required: true
  },
  generatedDate: {
    type: Date,
    default: Date.now
  }
});

// const CheatingLog = mongoose.model('CheatingLog', cheatingLogSchema);
// export default CheatingLog;
// const Company = mongoose.model('CheatingLog', cheatingLogSchema);
// module.exports = CheatingLog;
module.exports = mongoose.model('CheatingLog', cheatingLogSchema);
