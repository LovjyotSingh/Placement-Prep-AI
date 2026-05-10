// backend/src/routes/analytics.routes.js
const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { getDashboard } = require('../controllers/analytics.controller');

router.use(protect);
router.get('/dashboard', getDashboard);

module.exports = router;
