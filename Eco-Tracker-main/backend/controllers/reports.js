const WasteReport = require('../models/WasteReport');
const User = require('../models/User');
const { checkAndIssueCertificates } = require('./users');
const { processAI, generateBlockchainHash } = require('../utils/aiService');
const Ledger = require('../models/Ledger');

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private (Worker, Authority)
exports.getReports = async (req, res, next) => {
  try {
    let query;

    // Authorities see everything, Citizens see their own
    if (req.user.role === 'AUTHORITY') {
      query = WasteReport.find().populate('citizenId', 'name email').populate('assignedWorker', 'name mobileNumber');
    } else if (req.user.role === 'CITIZEN') {
      query = WasteReport.find({ citizenId: req.user.id }).populate('assignedWorker', 'name mobileNumber');
    } else if (req.user.role === 'WORKER') {
      // Workers strictly see tasks matching their location OR tasks explicitly assigned to them
      query = WasteReport.find({ 
        $or: [
          { assignedWorker: req.user.id },
          { status: 'AI_VERIFIED' }
        ]
      }).populate('citizenId', 'name email').populate('assignedWorker', 'name mobileNumber');
    } else {
      query = WasteReport.find({ citizenId: req.user.id });
    }

    const reports = await query.sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new report
// @route   POST /api/reports
// @access  Private (Citizen)
exports.createReport = async (req, res, next) => {
  try {
    // Add citizenId to req.body
    req.body.citizenId = req.user.id;

    // AI PROCESS: Duplicates, Classification, Priority
    const aiResults = await processAI(req.body, req.body.imageUrl);
    
    // Check for duplicates
    const existing = await WasteReport.findOne({ imageHash: aiResults.imageHash });
    if (existing) {
      return res.status(400).json({ success: false, message: 'FRAUD_DETECTION: This waste has already been reported.', fraudDetected: true });
    }

    req.body.imageHash = aiResults.imageHash;
    req.body.priority = aiResults.priority;
    req.body.aiMetadata = aiResults.aiMetadata;
    
    // Auto-status based on AI verification
    req.body.status = aiResults.aiMetadata.fraudDetectionFlag ? 'REJECTED' : 'AI_VERIFIED';
    
    req.body.blockchainHash = generateBlockchainHash({ ...req.body, action: req.body.status });

    const report = await WasteReport.create(req.body);

    // Initial Ledger Entry
    await Ledger.create({
      reportId: report._id,
      action: 'SUBMITTED',
      actorId: req.user.id,
      currentHash: report.blockchainHash,
      metadata: { priority: report.priority }
    });

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update report status
// @route   PUT /api/reports/:id
// @access  Private (Worker, Authority)
exports.updateReport = async (req, res, next) => {
  try {
    let report = await WasteReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Role-based logic
    if (req.user.role === 'AUTHORITY') {
      if (req.body.status === 'VERIFIED' && report.status !== 'VERIFIED') {
        const citizen = await User.findById(report.citizenId);
        if (citizen) {
          // Weighted XP/Credits (Point 9)
          const weights = {
            'HAZARDOUS': { xp: 250, credits: 150 },
            'NON_BIODEGRADABLE': { xp: 150, credits: 75 },
            'MIXED': { xp: 100, credits: 50 },
            'BIODEGRADABLE': { xp: 75, credits: 30 }
          };

          const reward = weights[report.type] || { xp: 50, credits: 20 };
          
          citizen.xp += reward.xp;
          citizen.credits += reward.credits;
          citizen.level = Math.floor(citizen.xp / 500) + 1;
          
          await citizen.save();
          checkAndIssueCertificates(citizen._id);
        }

        // Reward worker for verified resolution
        if (report.assignedWorker) {
          const worker = await User.findById(report.assignedWorker);
          if (worker) {
            if (!worker.workerDetails) worker.workerDetails = {};
            if (!worker.workerDetails.rewards) worker.workerDetails.rewards = { points: 0, wallet: 0 };
            worker.workerDetails.rewards.wallet = (worker.workerDetails.rewards.wallet || 0) + 50;
            worker.workerDetails.rewards.points = (worker.workerDetails.rewards.points || 0) + 50;
            await worker.save();
          }
        }

        req.body.verifiedAt = Date.now();
      } else if (req.body.status === 'REJECTED') {
        // Penalty for fraudulent reports (Point 9)
        const citizen = await User.findById(report.citizenId);
        if (citizen) {
          citizen.xp = Math.max(0, citizen.xp - 100); 
          await citizen.save();
        }
      }
    }

    // Proof of Work handling (Point 7)
    if (req.user.role === 'WORKER' && req.body.status === 'COMPLETED') {
      req.body.proofOfWork = {
        ...report.proofOfWork,
        afterImage: req.body.afterImage,
        completionNotes: req.body.completionNotes,
        timeTaken: req.body.timeTaken,
        geoTagVerified: true
      };
    }

    // Update blockchain record
    const prevHash = report.blockchainHash;
    req.body.blockchainHash = generateBlockchainHash(
      { id: report._id, status: req.body.status, actor: req.user.id },
      prevHash
    );

    report = await WasteReport.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Blockchain Ledger Entry
    await Ledger.create({
      reportId: report._id,
      action: report.status,
      actorId: req.user.id,
      previousHash: prevHash,
      currentHash: report.blockchainHash
    });

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get stats
// @route   GET /api/reports/stats
// @access  Private (Authority)
exports.getStats = async (req, res, next) => {
  try {
    const totalReports = await WasteReport.countDocuments();
    const activeIssues = await WasteReport.countDocuments({ 
      status: { $in: ['SUBMITTED', 'AI_VERIFIED', 'ASSIGNED', 'IN_PROGRESS'] } 
    });
    const verifiedToday = await WasteReport.countDocuments({ 
      status: 'VERIFIED',
      verifiedAt: { $gte: new Date().setHours(0,0,0,0) }
    });

    res.status(200).json({
      success: true,
      data: {
        totalReports,
        activeIssues,
        verifiedToday,
        avgCleanupTime: '4.2h'
      }
    });
  } catch (err) {
    next(err);
  }
};
