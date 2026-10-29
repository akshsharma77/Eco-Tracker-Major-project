const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { 
      name, email, password, role,
      mobileNumber, profilePhoto, location,
      citizenDetails, workerDetails, adminDetails
    } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Admin validation
    if (role === 'AUTHORITY') {
      const inviteCode = adminDetails?.adminCode || req.body.adminCode;
      if (inviteCode !== 'VIVA_ADMIN_2026') {
        return res.status(403).json({ success: false, message: 'Invalid Admin Invite Code. Registration restricted.' });
      }
    }

    // Auto-generate IDs and defaults
    let finalCitizenDetails = citizenDetails;
    let finalWorkerDetails = workerDetails;
    
    if (role === 'CITIZEN') {
      finalCitizenDetails = { ...citizenDetails, citizenId: 'CTZ-' + Math.floor(10000 + Math.random() * 90000) };
    }
    if (role === 'WORKER') {
      const cityCode = (location && location.city) 
        ? location.city.substring(0, 3).toUpperCase() 
        : 'GEN';
      finalWorkerDetails = { 
        ...workerDetails, 
        workerId: `WRK-${cityCode}-${Math.floor(1000 + Math.random() * 9000)}`,
        verification: { status: 'Approved' },
        attendance: { status: 'Online' },
        zone: workerDetails?.zone || { zoneId: 'Z-04', ward: workerDetails?.assignedArea || 'Ward 18' }
      };
    }

    // Create user object selectively
    const userObj = {
      name,
      email,
      password,
      role,
      mobileNumber,
      profilePhoto,
      location
    };

    if (role === 'CITIZEN' && finalCitizenDetails) {
      if (!finalCitizenDetails.age || finalCitizenDetails.age === '') delete finalCitizenDetails.age;
      userObj.citizenDetails = finalCitizenDetails;
    }
    if (role === 'WORKER' && finalWorkerDetails) {
      if (!finalWorkerDetails.experience || finalWorkerDetails.experience === '') delete finalWorkerDetails.experience;
      if (!finalWorkerDetails.dob || finalWorkerDetails.dob === '') delete finalWorkerDetails.dob;
      userObj.workerDetails = finalWorkerDetails;
    }
    if (role === 'AUTHORITY') userObj.adminDetails = adminDetails;

    user = await User.create(userObj);

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};
