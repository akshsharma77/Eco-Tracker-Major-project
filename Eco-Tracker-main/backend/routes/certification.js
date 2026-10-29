const express = require('express');
const { downloadCertificate } = require('../controllers/certification');
const { getGlobalLedger } = require('../controllers/ledger');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/download', protect, downloadCertificate);
router.get('/ledger', protect, authorize('AUTHORITY'), getGlobalLedger);

module.exports = router;
