// backend/src/routes/interview.routes.js
const router = require('express').Router();
const c = require('../controllers/interview.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/history', c.getHistory);
router.post('/start', c.startInterview);
router.get('/:id/next-question', c.getNextQuestion);
router.post('/:id/submit-response', c.submitResponse);
router.post('/:id/skip-question', c.skipQuestion);
router.post('/:id/complete', c.completeInterview);
router.get('/:id', c.getInterview);

module.exports = router;
