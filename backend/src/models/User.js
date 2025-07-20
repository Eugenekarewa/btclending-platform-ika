import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Google OAuth Information
  googleId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  picture: {
    type: String,
    default: null
  },

  // zkLogin Specific Information
  suiWalletAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userSalt: {
    type: String,
    required: true,
    unique: true
  },
  
  // JWT Claims for zkLogin
  iss: {
    type: String,
    required: true,
    default: 'https://accounts.google.com'
  },
  aud: {
    type: String,
    required: true
  },
  
  // Authentication Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: true // Google OAuth users are pre-verified
  },
  
  // Security and Tracking
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  loginCount: {
    type: Number,
    default: 1
  },
  
  // Session Management
  refreshTokens: [{
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 604800 // 7 days
    }
  }],

  // Preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },

  // Metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    registrationSource: {
      type: String,
      default: 'web'
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.refreshTokens;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better performance
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ suiWalletAddress: 1, isActive: 1 });
userSchema.index({ googleId: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user display name
userSchema.virtual('displayName').get(function() {
  return this.name || this.email.split('@')[0];
});

// Methods
userSchema.methods.toPublicJSON = function() {
  const user = this.toObject();
  delete user.refreshTokens;
  delete user.userSalt;
  delete user.metadata;
  return user;
};

userSchema.methods.updateLoginInfo = function(userAgent, ipAddress) {
  this.lastLoginAt = new Date();
  this.loginCount += 1;
  this.metadata.userAgent = userAgent;
  this.metadata.ipAddress = ipAddress;
  return this.save();
};

userSchema.methods.addRefreshToken = function(token) {
  this.refreshTokens.push({ token });
  // Keep only the last 5 refresh tokens
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }
  return this.save();
};

userSchema.methods.removeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  return this.save();
};

userSchema.methods.clearAllRefreshTokens = function() {
  this.refreshTokens = [];
  return this.save();
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase(), isActive: true });
};

userSchema.statics.findByGoogleId = function(googleId) {
  return this.findOne({ googleId, isActive: true });
};

userSchema.statics.findByWalletAddress = function(suiWalletAddress) {
  return this.findOne({ suiWalletAddress, isActive: true });
};

userSchema.statics.createFromGoogleOAuth = function(googleProfile, suiWalletAddress, userSalt, aud) {
  return this.create({
    googleId: googleProfile.id,
    email: googleProfile.email,
    name: googleProfile.name,
    picture: googleProfile.picture,
    suiWalletAddress,
    userSalt,
    aud,
    metadata: {
      registrationSource: 'google_oauth'
    }
  });
};

// Pre-save middleware
userSchema.pre('save', function(next) {
  // Ensure email is lowercase
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

// Create and export the model
const User = mongoose.model('User', userSchema);

export default User;