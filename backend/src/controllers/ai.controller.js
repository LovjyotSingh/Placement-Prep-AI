const ai = require('../services/ai.service');

// GET /api/ai/status
exports.getAIStatus = async (req, res) => {
  try {
    const status = await ai.getAIStatus();
    res.json({ status: 'success', data: status });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message || 'Could not fetch AI status' });
  }
};
