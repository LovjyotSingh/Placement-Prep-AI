const router = require('express').Router();
const { getAIStatus } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/status', getAIStatus);

module.exports = router;
