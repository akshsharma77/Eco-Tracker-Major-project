const AcademyModule = require('../models/AcademyModule');
const User = require('../models/User');
const { checkAndIssueCertificates } = require('./users');

// @desc    Get all academy modules with lock status
// @route   GET /api/academy
// @access  Private
exports.getModules = async (req, res, next) => {
  try {
    const modules = await AcademyModule.find().sort({ order: 1 });
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Logic: Module N is unlocked if Module N-1 is in user.academyProgress
    const completedModuleIds = (user.academyProgress || [])
      .filter(p => p && p.moduleId)
      .map(p => p.moduleId.toString());

    const processedModules = modules.map((mod, index) => {
      let isLocked = false;
      if (index > 0) {
        const prevModuleId = modules[index - 1]._id.toString();
        if (!completedModuleIds.includes(prevModuleId)) {
          isLocked = true;
        }
      }
      return {
        ...mod._doc,
        isLocked,
        isCompleted: completedModuleIds.includes(mod._id.toString())
      };
    });

    res.status(200).json({
      success: true,
      data: processedModules
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Submit quiz for a module
// @route   POST /api/academy/:id/submit
// @access  Private (Citizen)
exports.submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;
    console.log(`Quiz Submission for module ${req.params.id}:`, answers);
    console.log(`User ID: ${req.user.id} submitting answers in sequence matching question indices.`);
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Invalid answers format. Array expected.' });
    }
    const academyModule = await AcademyModule.findById(req.params.id);
    if (!academyModule) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    const user = await User.findById(req.user.id);

    // Validate answers
    let correctCount = 0;
    academyModule.quizQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const scorePercent = (correctCount / academyModule.quizQuestions.length) * 100;

    if (scorePercent < 60) {
      return res.status(200).json({
        success: false,
        message: `Quiz failed. You got ${scorePercent.toFixed(0)}%. You need 60% to pass.`,
        score: scorePercent
      });
    }

    // Check if already completed
    const alreadyCompleted = (user.academyProgress || []).find(p => p && p.moduleId && p.moduleId.toString() === req.params.id);
    
    if (!alreadyCompleted) {
      user.academyProgress.push({
        moduleId: academyModule._id,
        score: scorePercent
      });

      // Award rewards
      user.xp += academyModule.xpReward;
      user.credits += academyModule.creditsReward;
      user.level = Math.floor(user.xp / 500) + 1;

      // Logic: If all modules are completed, promote to CERTIFIED_CITIZEN
      const totalModules = await AcademyModule.countDocuments();
      if (user.academyProgress.length >= totalModules) {
        user.subRole = 'CERTIFIED_CITIZEN';
        // Force certificate check
        await checkAndIssueCertificates(user._id);
      }

      await user.save();
    }

    res.status(200).json({
      success: true,
      message: `Congratulations! You passed with ${scorePercent.toFixed(0)}%!`,
      data: {
        score: scorePercent,
        xp: user.xp,
        credits: user.credits,
        subRole: user.subRole
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
