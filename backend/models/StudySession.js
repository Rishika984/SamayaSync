const mongoose = require('mongoose');

const studySessionSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
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
    goal: {
      type: String,
      default: '',
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

studySessionSchema.index({ userId: 1, studyDate: -1 });

module.exports = mongoose.model('StudySession', studySessionSchema);