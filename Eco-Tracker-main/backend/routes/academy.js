const express = require('express');
const { getModules, submitQuiz } = require('../controllers/academy');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getModules);
router.post('/:id/submit', protect, authorize('CITIZEN'), submitQuiz);

module.exports = router;
