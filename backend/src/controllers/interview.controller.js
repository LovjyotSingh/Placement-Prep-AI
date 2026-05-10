const Interview = require('../models/Interview.model');
const Response = require('../models/Response.model');
const User = require('../models/User.model');
const ai = require('../services/ai.service');

// POST /api/interviews/start
exports.startInterview = async (req, res) => {
  try {
    const { targetRole, difficulty = 'medium', questionCount = 10 } = req.body;
    if (!targetRole) return res.status(400).json({ status: 'error', message: 'targetRole is required' });

    const interview = await Interview.create({
      userId: req.user.id,
      targetRole,
      difficulty,
      totalQuestions: questionCount
    });

    res.status(201).json({
      status: 'success',
      data: { interviewId: interview._id, targetRole, totalQuestions: questionCount }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Could not start interview' });
  }
};

// GET /api/interviews/:id/next-question
exports.getNextQuestion = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user.id })
      .populate('responses', 'question');

    if (!interview) return res.status(404).json({ status: 'error', message: 'Interview not found' });

    if (interview.answeredQuestions >= interview.totalQuestions) {
      return res.json({ status: 'success', data: { completed: true } });
    }

    const previousQuestions = interview.responses.map(r => r.question);
    const uniquenessSeed = `${interview._id}-${req.user.id}-${interview.createdAt?.getTime?.() || Date.now()}`;
    const questions = await ai.generateQuestions(
      interview.targetRole,
      interview.difficulty,
      1,
      previousQuestions,
      { uniquenessSeed }
    );

    if (!questions.length) return res.status(500).json({ status: 'error', message: 'AI failed to generate question. Check your API key.' });

    res.json({
      status: 'success',
      data: {
        question: questions[0],
        currentIndex: interview.answeredQuestions,
        totalQuestions: interview.totalQuestions,
        completed: false
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message || 'Failed to get question' });
  }
};

// POST /api/interviews/:id/submit-response
exports.submitResponse = async (req, res) => {
  try {
    const { question, questionCategory, answer, timeSpent } = req.body;
    if (!question) return res.status(400).json({ status: 'error', message: 'question is required' });
    if (answer === undefined || answer === null) {
      return res.status(400).json({ status: 'error', message: 'answer is required' });
    }

    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user.id });
    if (!interview) return res.status(404).json({ status: 'error', message: 'Interview not found' });

    const normalizedAnswer = String(answer);
    const isBlankAnswer = normalizedAnswer.trim().length === 0;
    const evaluation = isBlankAnswer
      ? {
        score: 0,
        technicalScore: 0,
        clarityScore: 0,
        confidenceScore: 0,
        strengths: ['No answer submitted'],
        improvements: ['Provide at least a brief attempt to receive meaningful feedback'],
        feedback: 'No response was provided, so this question is scored 0.'
      }
      : await ai.evaluateResponse(question, normalizedAnswer, interview.targetRole);

    const response = await Response.create({
      interviewId: interview._id,
      question,
      category: questionCategory || 'technical',
      userAnswer: normalizedAnswer,
      timeSpent: timeSpent || 0,
      evaluation
    });

    interview.responses.push(response._id);
    interview.answeredQuestions += 1;
    await interview.save();

    res.json({
      status: 'success',
      data: { evaluation, nextQuestionAvailable: interview.answeredQuestions < interview.totalQuestions }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message || 'Evaluation failed' });
  }
};

// POST /api/interviews/:id/skip-question
exports.skipQuestion = async (req, res) => {
  try {
    const { question, questionCategory, timeSpent } = req.body;
    if (!question) return res.status(400).json({ status: 'error', message: 'question is required' });

    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user.id });
    if (!interview) return res.status(404).json({ status: 'error', message: 'Interview not found' });

    if (interview.answeredQuestions >= interview.totalQuestions) {
      return res.status(400).json({ status: 'error', message: 'Interview is already complete' });
    }

    const response = await Response.create({
      interviewId: interview._id,
      question,
      category: questionCategory || 'technical',
      skipped: true,
      userAnswer: '[SKIPPED]',
      timeSpent: timeSpent || 0,
      evaluation: {
        score: 0,
        technicalScore: 0,
        clarityScore: 0,
        confidenceScore: 0,
        strengths: [],
        improvements: [],
        feedback: 'Question skipped by user.'
      }
    });

    interview.responses.push(response._id);
    interview.answeredQuestions += 1;
    await interview.save();

    res.json({
      status: 'success',
      data: { skipped: true, nextQuestionAvailable: interview.answeredQuestions < interview.totalQuestions }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message || 'Could not skip question' });
  }
};

// POST /api/interviews/:id/complete
exports.completeInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user.id });
    if (!interview) return res.status(404).json({ status: 'error', message: 'Interview not found' });

    await interview.complete();

    // Generate AI overall feedback
    let feedback = {};
    try {
      feedback = await ai.generateOverallFeedback(interview.targetRole, interview.overallScore, interview.scores);
    } catch { feedback = { summary: 'Great effort! Keep practicing.', strengths: [], improvementAreas: [], recommendations: [] }; }

    interview.strengths = feedback.strengths;
    interview.improvementAreas = feedback.improvementAreas;
    interview.overallFeedback = feedback.summary;
    await interview.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'stats.totalInterviews': 1 },
      'stats.lastInterviewDate': new Date()
    });

    res.json({
      status: 'success',
      data: { ...interview.toObject(), feedback }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Could not complete interview' });
  }
};

// GET /api/interviews/history
exports.getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const interviews = await Interview.find({ userId: req.user.id, status: 'completed' })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('targetRole overallScore scores duration createdAt');

    const total = await Interview.countDocuments({ userId: req.user.id, status: 'completed' });

    res.json({
      status: 'success',
      data: { interviews, total, page, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Could not fetch history' });
  }
};

// GET /api/interviews/:id
exports.getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user.id })
      .populate('responses');
    if (!interview) return res.status(404).json({ status: 'error', message: 'Interview not found' });
    res.json({ status: 'success', data: { interview } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Could not fetch interview' });
  }
};
