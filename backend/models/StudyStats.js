const mongoose = require('mongoose');

const studyStatsSchema = mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSessions: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastStudyDate: {
      type: Date,
      default: null,
    },
    averageSessionMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StudyStats', studyStatsSchema);