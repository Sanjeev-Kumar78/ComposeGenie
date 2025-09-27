const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'web-application',
      'database',
      'messaging',
      'monitoring',
      'ci-cd',
      'development',
      'production',
      'microservices',
      'data-processing',
      'security',
    ],
  },
  version: {
    type: String,
    required: true,
    default: '1.0.0',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  templateContent: {
    type: String,
    required: true,
  },
  variables: [{
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['string', 'number', 'boolean', 'array', 'object'],
    },
    description: {
      type: String,
      required: true,
    },
    defaultValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    required: {
      type: Boolean,
      default: false,
    },
    validation: {
      pattern: String,
      minLength: Number,
      maxLength: Number,
      minimum: Number,
      maximum: Number,
      enum: [String],
    },
  }],
  services: [{
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    ports: [String],
    volumes: [String],
    environment: [{
      key: String,
      value: String,
    }],
  }],
  networks: [{
    name: {
      type: String,
      required: true,
    },
    driver: {
      type: String,
      default: 'bridge',
    },
    external: {
      type: Boolean,
      default: false,
    },
  }],
  volumes: [{
    name: {
      type: String,
      required: true,
    },
    driver: {
      type: String,
      default: 'local',
    },
    external: {
      type: Boolean,
      default: false,
    },
  }],
  metadata: {
    author: {
      type: String,
      required: true,
    },
    authorEmail: {
      type: String,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    license: {
      type: String,
      default: 'MIT',
    },
    homepage: String,
    repository: String,
    documentation: String,
  },
  usage: {
    downloadCount: {
      type: Number,
      default: 0,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    lastUsed: Date,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for performance
templateSchema.index({ name: 1 });
templateSchema.index({ category: 1 });
templateSchema.index({ tags: 1 });
templateSchema.index({ isPublic: 1, isActive: 1 });
templateSchema.index({ 'usage.rating.average': -1 });
templateSchema.index({ 'usage.downloadCount': -1 });
templateSchema.index({ createdAt: -1 });

// Virtual for full template info
templateSchema.virtual('fullName').get(function() {
  return `${this.name} v${this.version}`;
});

// Pre-save middleware
templateSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedBy = this._req?.user?.id || this.updatedBy;
  }
  next();
});

// Instance methods
templateSchema.methods.incrementDownloadCount = function() {
  this.usage.downloadCount += 1;
  this.usage.lastUsed = new Date();
  return this.save();
};

templateSchema.methods.addRating = function(rating) {
  const currentTotal = this.usage.rating.average * this.usage.rating.count;
  this.usage.rating.count += 1;
  this.usage.rating.average = (currentTotal + rating) / this.usage.rating.count;
  return this.save();
};

// Static methods
templateSchema.statics.findByCategory = function(category) {
  return this.find({ category, isPublic: true, isActive: true });
};

templateSchema.statics.findPopular = function(limit = 10) {
  return this.find({ isPublic: true, isActive: true })
    .sort({ 'usage.downloadCount': -1, 'usage.rating.average': -1 })
    .limit(limit);
};

templateSchema.statics.search = function(searchTerm) {
  return this.find({
    $and: [
      { isPublic: true, isActive: true },
      {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } },
        ],
      },
    ],
  });
};

module.exports = mongoose.model('Template', templateSchema);