const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  RoleID: {
    type: String,
    required: true,
    unique: true,
  },
  RoleName: {
    type: String,
    required: true,
    enum: ['candidate', 'admin', 'hiring_manager'],
  },
});

module.exports = mongoose.model("Role", roleSchema);
