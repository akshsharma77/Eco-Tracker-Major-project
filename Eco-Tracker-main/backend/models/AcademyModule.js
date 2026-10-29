const mongoose = require('mongoose');

const AcademyModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['WASTE_SEGREGATION', 'RECYCLING_PRO', 'HAZARDOUS_HANDLING', 'ECO_LIFESTYLE'],
    required: true 
  },
  content: { type: String, required: true }, // Markdown or HTML
  order: { type: Number, required: true },
  quizQuestions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true } // Index of options
  }],
  xpReward: { type: Number, default: 100 },
  creditsReward: { type: Number, default: 50 },
  duration: { type: String }, // e.g. "10 mins"
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AcademyModule', AcademyModuleSchema);
