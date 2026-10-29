const express = require('express');
const { getProfile, getWorkers, getCitizens, getLeaderboard, createWorker } = require('../controllers/users');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/leaderboard', getLeaderboard); // Public

router.use(protect); // All other routes protected

router.get('/profile', getProfile);
router.get('/workers', authorize('AUTHORITY'), getWorkers);
router.post('/workers', authorize('AUTHORITY'), createWorker);
router.get('/citizens', authorize('AUTHORITY'), getCitizens);

module.exports = router;
