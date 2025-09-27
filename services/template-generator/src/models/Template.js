const mongoose = require('mongoose');

// Simplified Template Schema for MVP
const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['web', 'database', 'messaging', 'monitoring', 'development', 'other'],
  },
  templateContent: {
    type: String,
    required: true,
  },
  variables: [{
    name: String,
    type: String,
    description: String,
    defaultValue: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Template', templateSchema);