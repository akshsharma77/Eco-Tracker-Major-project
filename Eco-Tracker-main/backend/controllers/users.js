const User = require('../models/User');
const Certification = require('../models/Certification');
const crypto = require('crypto');
const AcademyModule = require('../models/AcademyModule');

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'CITIZEN' })
      .select('name xp level credits')
      .sort({ xp: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all workers with task metrics
// @route   GET /api/users/workers
// @access  Private (Authority)
exports.getWorkers = async (req, res, next) => {
  try {
    const workers = await User.find({ role: 'WORKER' }).select('-password');
    const WasteReport = require('../models/WasteReport');
    const tasks = await WasteReport.find().select('assignedWorker status priority');

    const workersWithStats = workers.map(w => {
      const workerTasks = tasks.filter(t => t.assignedWorker && t.assignedWorker.toString() === w._id.toString());
      const completedCount = workerTasks.filter(t => t.status === 'COMPLETED' || t.status === 'VERIFIED').length;
      const activeCount = workerTasks.filter(t => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS').length;

      return {
        ...w.toObject(),
        taskStats: {
          total: workerTasks.length,
          completed: completedCount,
          active: activeCount
        }
      };
    });

    res.status(200).json({
      success: true,
      count: workersWithStats.length,
      data: workersWithStats
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get all citizens with complaint activity metrics
// @route   GET /api/users/citizens
// @access  Private (Authority)
exports.getCitizens = async (req, res, next) => {
  try {
    const citizens = await User.find({ role: 'CITIZEN' }).select('-password').sort({ createdAt: -1 });
    const WasteReport = require('../models/WasteReport');
    const reports = await WasteReport.find().select('citizenId status');

    const citizensWithStats = citizens.map(c => {
      const userReports = reports.filter(r => r.citizenId && r.citizenId.toString() === c._id.toString());
      const resolvedCount = userReports.filter(r => r.status === 'VERIFIED' || r.status === 'COMPLETED').length;
      const rejectedCount = userReports.filter(r => r.status === 'REJECTED').length;
      const activeCount = userReports.length - resolvedCount - rejectedCount;

      return {
        ...c.toObject(),
        reportStats: {
          total: userReports.length,
          resolved: resolvedCount,
          active: activeCount,
          rejected: rejectedCount
        }
      };
    });

    res.status(200).json({
      success: true,
      count: citizensWithStats.length,
      data: citizensWithStats
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    // Auto-check for certificates on profile load
    await exports.checkAndIssueCertificates(req.user.id);
    
    const user = await User.findById(req.user.id).select('-password');
    const certs = await Certification.find({ userId: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        user,
        certifications: certs
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Check and issue certificates manually or internally
exports.checkAndIssueCertificates = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const certsToIssue = [];

    // XP Based Certificates
    if (user.xp >= 500 && user.xp < 2000) certsToIssue.push('BRONZE_RECYCLER');
    if (user.xp >= 2000 && user.xp < 5000) certsToIssue.push('SILVER_HERO');
    if (user.xp >= 5000) certsToIssue.push('EMERALD_LEDGER_MASTER');

    // Academy Based Certificates
    // If user is CERTIFIED_CITIZEN (completed all modules)
    if (user.subRole === 'CERTIFIED_CITIZEN') {
      certsToIssue.push('ECO_ACADEMY_GRADUATE');
    }

    for (const certType of certsToIssue) {
      // Check if already has it
      const existing = await Certification.findOne({ userId, type: certType });
      if (!existing) {
        const hash = crypto.createHash('sha256').update(`${userId}-${certType}-${Date.now()}`).digest('hex');
        await Certification.create({ 
          userId, 
          type: certType, 
          certificateHash: hash,
          issuedAt: Date.now()
        });
      }
    }
  } catch (err) {
    console.error('Error issuing certificate:', err);
  }
};

// @desc    Create a new worker node
// @route   POST /api/users/workers
// @access  Private (Authority)
exports.createWorker = async (req, res, next) => {
  try {
    const { 
      name, email, password, mobileNumber, profilePhoto, location, workerDetails 
    } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Generate city prefix or fallback to GEN
    const cityCode = (location && location.city) 
      ? location.city.substring(0, 3).toUpperCase() 
      : 'GEN';
      
    const finalWorkerDetails = { 
      ...workerDetails, 
      workerId: `WRK-${cityCode}-${Math.floor(1000 + Math.random() * 9000)}`
    };

    user = await User.create({
      name,
      email,
      password,
      role: 'WORKER',
      mobileNumber,
      profilePhoto,
      location,
      workerDetails: finalWorkerDetails
    });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
