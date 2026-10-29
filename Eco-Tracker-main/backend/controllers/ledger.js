const Ledger = require('../models/Ledger');
const WasteReport = require('../models/WasteReport');

// @desc    Get full audit trail for a report
// @route   GET /api/reports/:id/audit
// @access  Private
exports.getAuditTrail = async (req, res, next) => {
  try {
    const logs = await Ledger.find({ reportId: req.params.id })
      .populate('actorId', 'name role')
      .sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Global Blockchain Explorer
// @route   GET /api/certification/ledger (using certification router for simplicity)
// @access  Public
exports.getGlobalLedger = async (req, res, next) => {
  try {
    const logs = await Ledger.find()
      .populate('reportId', 'type location')
      .populate('actorId', 'name')
      .sort({ timestamp: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
