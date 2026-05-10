const Interview = require('../models/Interview.model');

// GET /api/analytics/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [interviews, recentInterviews] = await Promise.all([
      Interview.find({ userId, status: 'completed' }).select('overallScore scores createdAt targetRole duration'),
      Interview.find({ userId, status: 'completed' }).sort({ createdAt: -1 }).limit(5).select('targetRole overallScore createdAt')
    ]);

    const totalInterviews = interviews.length;
    const averageScore = totalInterviews > 0
      ? Math.round(interviews.reduce((a, i) => a + i.overallScore, 0) / totalInterviews)
      : 0;
    const highestScore = totalInterviews > 0 ? Math.max(...interviews.map(i => i.overallScore)) : 0;

    // Score trend (last 10 interviews)
    const trend = interviews.slice(-10).map(i => ({
      date: i.createdAt.toISOString().split('T')[0],
      score: i.overallScore,
      role: i.targetRole
    }));

    // Role breakdown
    const roleBreakdown = {};
    interviews.forEach(i => {
      if (!roleBreakdown[i.targetRole]) roleBreakdown[i.targetRole] = { count: 0, totalScore: 0 };
      roleBreakdown[i.targetRole].count++;
      roleBreakdown[i.targetRole].totalScore += i.overallScore;
    });
    const roleStats = Object.entries(roleBreakdown).map(([role, data]) => ({
      role,
      count: data.count,
      averageScore: Math.round(data.totalScore / data.count)
    }));

    // Average scores breakdown
    const avgTechnical = totalInterviews > 0
      ? Math.round(interviews.reduce((a, i) => a + (i.scores?.technical || 0), 0) / totalInterviews) : 0;
    const avgCommunication = totalInterviews > 0
      ? Math.round(interviews.reduce((a, i) => a + (i.scores?.communication || 0), 0) / totalInterviews) : 0;
    const avgConfidence = totalInterviews > 0
      ? Math.round(interviews.reduce((a, i) => a + (i.scores?.confidence || 0), 0) / totalInterviews) : 0;

    res.json({
      status: 'success',
      data: {
        overview: { totalInterviews, averageScore, highestScore },
        scoreBreakdown: { technical: avgTechnical, communication: avgCommunication, confidence: avgConfidence },
        trend,
        roleStats,
        recentInterviews
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Could not fetch analytics' });
  }
};
