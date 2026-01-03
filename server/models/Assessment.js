const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseName: {
    type: String,
    required: true // e.g., 'Full Stack Web Development'
  },
  // Overall assessment summary
  overallScore: {
    type: Number, 
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  // Assessment per section (HTML, CSS, JS, etc.)
  sections: [{
    name: { type: String, required: true },
    score: { type: Number, required: true },
    status: { type: String }, // e.g., 'Good', 'Needs Improvement'
    feedback: { type: String, required: true }
  }],
  // Store raw AI response for debugging/future improvements
  aiResponse: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Assessment', assessmentSchema);
