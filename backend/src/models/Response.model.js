const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
  question: { type: String, required: true },
  category: { type: String, default: 'technical' },
  skipped: { type: Boolean, default: false },
  userAnswer: { type: String, default: '' },
  timeSpent: { type: Number, default: 0 },
  evaluation: {
    score: { type: Number, min: 0, max: 100, default: 0 },
    technicalScore: { type: Number, min: 0, max: 100, default: 0 },
    clarityScore: { type: Number, min: 0, max: 100, default: 0 },
    confidenceScore: { type: Number, min: 0, max: 100, default: 0 },
    strengths: [String],
    improvements: [String],
    feedback: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Response', responseSchema);
