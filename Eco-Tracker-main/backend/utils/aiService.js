const crypto = require('crypto');
const WasteReport = require('../models/WasteReport');

/**
 * SIMULATED AI SERVICE
 * In a real-world scenario, this would call a Python/FastAPI microservice or a CNN model.
 */

exports.processAI = async (reportData, imageBase64) => {
  // 1. Generate Image Hash for Duplicate Detection
  const imageHash = crypto.createHash('sha256').update(imageBase64 || '').digest('hex');
  
  // Check for duplicate uploads (mock logic)
  const isDuplicate = Math.random() < 0.05; // 5% chance of being a duplicate in simulation

  // 2. Mock Waste Classification & Confidence
  const wasteTypes = ['BIODEGRADABLE', 'NON_BIODEGRADABLE', 'MIXED', 'HAZARDOUS'];
  const detectedType = reportData.type || wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
  const confidence = Math.floor(Math.random() * (99 - 85) + 85); // 85-99% confidence
  
  // 3. Fraud Detection & Authenticity Simulation
  const isAuthentic = Math.random() > 0.02; // 2% chance of being fake/internet image
  const fraudDetectionFlag = isDuplicate || !isAuthentic;

  // 4. Smart Contextual Logic for Priority
  let priority = 'MEDIUM';
  const description = (reportData.description || '').toLowerCase();
  
  if (detectedType === 'HAZARDOUS' || description.includes('emergency') || description.includes('danger')) {
    priority = 'HIGH';
  } else if (description.includes('small') || description.includes('minor')) {
    priority = 'LOW';
  }

  // Tags: Multi-label classification simulation
  const tags = [detectedType];
  if (fraudDetectionFlag) tags.push('POTENTIAL_FRAUD');
  if (isDuplicate) tags.push('DUPLICATE_UPLOAD');
  if (priority === 'HIGH') tags.push('URGENT_COLLECTION');

  return {
    imageHash,
    priority,
    aiMetadata: {
      confidence: confidence,
      detectedType,
      fraudDetectionFlag,
      isAuthentic,
      tags,
      analysisTime: `${(Math.random() * 2 + 1).toFixed(1)}s`
    }
  };
};

/**
 * BLOCKCHAIN LEDGER UTILITY
 * Implements cryptographic chaining: currentHash = hash(data + previousHash + timestamp)
 */
const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

exports.generateBlockchainHash = (data, prevHash = GENESIS_HASH) => {
  const content = JSON.stringify(data) + prevHash + Date.now();
  return crypto.createHash('sha256').update(content).digest('hex');
};
