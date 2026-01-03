const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  step: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  type: {
    type: String,
    enum: ['code', 'screenshot'],
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  serverPath: {
    type: String,
    required: true
  },
  mimeType: {
    type: String
  },
  size: {
    type: Number
  }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
