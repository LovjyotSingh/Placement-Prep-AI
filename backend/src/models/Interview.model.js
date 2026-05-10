const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRole: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  status: { type: String, enum: ['in-progress', 'completed', 'abandoned'], default: 'in-progress' },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  duration: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 10 },
  answeredQuestions: { type: Number, default: 0 },
  overallScore: { type: Number, default: 0 },
  scores: {
    technical: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 }
  },
  responses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Response' }],
  strengths: [String],
  improvementAreas: [String],
  overallFeedback: String
}, { timestamps: true });

interviewSchema.methods.complete = async function () {
  this.status = 'completed';
  this.endTime = new Date();
  this.duration = Math.floor((this.endTime - this.startTime) / 1000);

  await this.populate('responses');
  const scoredResponses = this.responses.filter(r => !r.skipped);
  if (scoredResponses.length > 0) {
    const count = scoredResponses.length;
    const sum = (field) => scoredResponses.reduce((a, r) => a + (r.evaluation?.[field] || 0), 0);
    this.overallScore = Math.round(sum('score') / count);
    this.scores.technical = Math.round(sum('technicalScore') / count);
    this.scores.communication = Math.round(sum('clarityScore') / count);
    this.scores.confidence = Math.round(sum('confidenceScore') / count);
  }
  return this.save();
};

module.exports = mongoose.model('Interview', interviewSchema);
