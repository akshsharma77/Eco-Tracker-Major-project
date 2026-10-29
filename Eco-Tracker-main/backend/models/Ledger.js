const mongoose = require('mongoose');

const LedgerSchema = new mongoose.Schema({
  reportId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'WasteReport',
    required: true
  },
  action: { 
    type: String, 
    required: true // e.g., 'SUBMITTED', 'VERIFIED', 'ASSIGNED', 'COLLECTED'
  },
  actorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  previousHash: { type: String },
  currentHash: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed } 
});

module.exports = mongoose.model('Ledger', LedgerSchema);
