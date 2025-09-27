const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
  },
  profile: {
    avatar: String,
    bio: {
      type: String,
      maxlength: 500,
    },
    organization: {
      type: String,
      maxlength: 100,
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please enter a valid URL'],
    },
    location: {
      type: String,
      maxlength: 100,
    },
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    publicProfile: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light',
    },
  },
  statistics: {
    templatesCreated: {
      type: Number,
      default: 0,
    },
    templatesDownloaded: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  lastLogin: Date,
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    },
  },
  toObject: { virtuals: true },
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1, isVerified: 1 });

// Virtuals
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('templatesCount', {
  ref: 'Template',
  localField: '_id',
  foreignField: 'createdBy',
  count: true,
});

// Instance methods
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

userSchema.methods.incrementTemplateCount = function() {
  this.statistics.templatesCreated += 1;
  return this.save();
};

userSchema.methods.incrementDownloadCount = function() {
  this.statistics.templatesDownloaded += 1;
  return this.save();
};

userSchema.methods.addRating = function(rating) {
  const currentTotal = this.statistics.averageRating * this.statistics.totalRatings;
  this.statistics.totalRatings += 1;
  this.statistics.averageRating = (currentTotal + rating) / this.statistics.totalRatings;
  return this.save();
};

// Static methods
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true, isVerified: true });
};

userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

module.exports = mongoose.model('User', userSchema);