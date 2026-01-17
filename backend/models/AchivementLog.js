const mongoose = require('mongoose');

const achievementLogSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    achievementKey: {
      type: String,
      required: true,
      trim: true,
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one achievement per user
achievementLogSchema.index({ userId: 1, achievementKey: 1 }, { unique: true });

module.exports = mongoose.model('AchievementLog', achievementLogSchema);