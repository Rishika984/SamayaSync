const mongoose = require('mongoose');

const studySessionSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 0,
    },
    studyDate: {
      type: Date,
      required: true,
      index: true,
    },
    dayOfWeek: {
      type: String,
      required: true,
      enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
studySessionSchema.index({ userId: 1, studyDate: -1 });

module.exports = mongoose.model('StudySession', studySessionSchema);