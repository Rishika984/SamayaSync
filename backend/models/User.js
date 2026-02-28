const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      minlength: 6,
      select: false,
      required: function () {
        return this.provider === 'local';
      },
    },

    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },

    googleId: String,
    avatar: String,
    profileImage: String,

    nickName: {
      type: String,
      default: '',
      maxlength: 30,
    },

    studyGoal: {
      type: String,
      default: '2 hours daily',
      enum: ['30 minutes daily', '1 hour daily', '2 hours daily', '3 hours daily', '4+ hours daily'],
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Password reset fields
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for study sessions
userSchema.virtual('studySessions', {
  ref: 'StudySession',
  localField: '_id',
  foreignField: 'userId',
});

// Virtual for study stats
userSchema.virtual('studyStats', {
  ref: 'StudyStats',
  localField: '_id',
  foreignField: '_id',
  justOne: true,
});

// Virtual for study plans
userSchema.virtual('studyPlans', {
  ref: 'StudyPlan',
  localField: '_id',
  foreignField: 'userId',
});

// Virtual for achievements
userSchema.virtual('achievements', {
  ref: 'AchievementLog',
  localField: '_id',
  foreignField: 'userId',
});

// Virtual for streak history
userSchema.virtual('streakHistory', {
  ref: 'StreakHistory',
  localField: '_id',
  foreignField: 'userId',
});

// Hash password (skip Google users)
userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);