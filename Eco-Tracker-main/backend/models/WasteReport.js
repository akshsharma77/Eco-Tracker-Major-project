const mongoose = require('mongoose');

const WasteReportSchema = new mongoose.Schema({
  citizenId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String },
  landmark: { type: String },
  type: { 
    type: String, 
    enum: ['BIODEGRADABLE', 'NON_BIODEGRADABLE', 'MIXED', 'HAZARDOUS'], 
    required: true 
  },
  weight: { type: String }, // Optional during registration
  location: {
    address: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  status: { 
    type: String, 
    enum: ['SUBMITTED', 'AI_VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'REJECTED', 'CLOSED'], 
    default: 'SUBMITTED' 
  },
  assignedWorker: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  priority: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH'], 
    default: 'MEDIUM' 
  },
  aiMetadata: {
    confidence: { type: Number, default: 0 },
    detectedType: { type: String },
    fraudDetectionFlag: { type: Boolean, default: false },
    isAuthentic: { type: Boolean, default: true },
    tags: [String]
  },
  proofOfWork: {
    beforeImage: { type: String },
    afterImage: { type: String },
    completionNotes: { type: String },
    timeTaken: { type: Number }, // in minutes
    geoTagVerified: { type: Boolean, default: false }
  },
  blockchainHash: { type: String, unique: true, sparse: true },
  imageHash: { type: String }, 
  imageUrl: { type: String },
  timestamp: { type: Date, default: Date.now },
  verifiedAt: { type: Date }
});

module.exports = mongoose.model('WasteReport', WasteReportSchema);
