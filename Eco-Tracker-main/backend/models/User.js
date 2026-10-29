const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // Common Fields
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobileNumber: { type: String },
  profilePhoto: { type: String },
  location: {
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  role: { 
    type: String, 
    enum: ['CITIZEN', 'WORKER', 'AUTHORITY'], 
    default: 'CITIZEN' 
  },
  
  // Citizen Details
  citizenDetails: {
    username: { type: String },
    age: { type: Number },
    gender: { type: String },
    occupation: { type: String },
    preferredLanguage: { type: String },
    notificationPreferences: { type: String, enum: ['SMS', 'Email', 'App'], default: 'App' },
    awarenessLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    citizenId: { type: String }
  },

  // Worker Details
  workerDetails: {
    workerId: { type: String },
    workerType: { type: String, enum: ['Collector', 'Verifier', 'Supervisor', 'Driver', ''] },
    zone: {
      zoneId: { type: String },
      ward: { type: String }
    },
    shift: {
      start: { type: String },
      end: { type: String },
      type: { type: String, enum: ['Morning', 'Evening', 'Night', ''] }
    },
    tasks: {
      current: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }],
      history: [{
        taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
        type: { type: String },
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        priority: { type: String }
      }]
    },
    performance: {
      score: { type: Number, default: 0 },
      efficiency: { type: Number, default: 0 },
      avgCompletionTime: { type: Number, default: 0 },
      accuracy: { type: Number, default: 0 }
    },
    attendance: {
      checkIn: { type: Date },
      checkOut: { type: Date },
      status: { type: String, enum: ['Online', 'Offline', 'On Duty'], default: 'Offline' }
    },
    verification: {
      idType: { type: String },
      idNumber: { type: String },
      status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
      documents: [{ type: String }],
      selfieUpload: { type: String }
    },
    rewards: {
      points: { type: Number, default: 0 },
      penalties: { type: Number, default: 0 },
      wallet: { type: Number, default: 0 },
      transactions: [{
        type: { type: String, enum: ['Reward', 'Penalty'] },
        amount: { type: Number },
        timestamp: { type: Date, default: Date.now },
        blockchainHash: { type: String }
      }]
    },
    // Backwards compatibility
    experience: { type: Number },
    emergencyContact: { type: String },
    gender: { type: String },
    dob: { type: Date }
  },

  // Admin Details
  adminDetails: {
    adminCode: { type: String },
    departmentName: { type: String },
    designation: { type: String },
    roleLevel: { type: String, enum: ['Super Admin', 'Area Admin', 'Moderator'], default: 'Area Admin' }
  },

  // Legacy/System Fields
  credits: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  assignedSector: { type: String }, // Keeping for backwards compatibility
  academyProgress: [{
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademyModule' },
    score: Number,
    completedAt: { type: Date, default: Date.now }
  }],
  subRole: { type: String, enum: ['CITIZEN', 'CERTIFIED_CITIZEN'], default: 'CITIZEN' },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
