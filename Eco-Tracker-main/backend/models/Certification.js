const mongoose = require('mongoose');

const CertificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['BRONZE_RECYCLER', 'SILVER_HERO', 'EMERALD_LEDGER_MASTER', 'ECO_ACADEMY_GRADUATE'], 
    required: true 
  },
  issuedAt: { type: Date, default: Date.now },
  certificateHash: { type: String, unique: true }, // For blockchain simulation
  isVerified: { type: Boolean, default: true }
});

module.exports = mongoose.model('Certification', CertificationSchema);
