const mongoose = require('mongoose');

const streakHistorySchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    studied: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one entry per user per day
streakHistorySchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('StreakHistory', streakHistorySchema);