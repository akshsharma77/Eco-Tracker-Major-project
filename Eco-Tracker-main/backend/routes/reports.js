const express = require('express');
const { getReports, createReport, updateReport, getStats } = require('../controllers/reports');
const { getAuditTrail } = require('../controllers/ledger');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes protected

router.route('/')
  .get(getReports)
  .post(authorize('CITIZEN'), createReport);

router.route('/stats')
  .get(authorize('AUTHORITY'), getStats);

router.route('/:id')
  .put(authorize('WORKER', 'AUTHORITY'), updateReport);

router.route('/:id/audit')
  .get(getAuditTrail);

module.exports = router;
