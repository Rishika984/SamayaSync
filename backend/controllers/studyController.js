const StudyStats = require('../models/StudyStats');
const StudySession = require('../models/StudySession');
const StudyPlan = require('../models/StudyPlan');
const StreakHistory = require('../models/StreakHistory');

// ============================================
// STUDY STATS
// ============================================

// @desc    Get user study stats
// @route   GET /api/study/stats
// @access  Private
exports.getStudyStats = async (req, res) => {
  try {
    let stats = await StudyStats.findById(req.user._id);
    
    if (!stats) {
      stats = await StudyStats.create({
        _id: req.user._id,
        totalMinutes: 0,
        totalSessions: 0,
        currentStreak: 0,
        lastStudyDate: null,
        averageSessionMinutes: 0,
      });
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Recalculate user study stats from all sessions
// @route   POST /api/study/stats/recalculate
// @access  Private
exports.recalculateStats = async (req, res) => {
  try {
    // Get all sessions for this user
    const sessions = await StudySession.find({ userId: req.user._id });
    
    // Calculate totals from actual sessions
    const totalMinutes = sessions.reduce((sum, session) => sum + (session.durationMinutes || 0), 0);
    const totalSessions = sessions.length;
    const averageSessionMinutes = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
    
    // Get last study date
    const lastStudyDate = sessions.length > 0 
      ? sessions.sort((a, b) => new Date(b.studyDate) - new Date(a.studyDate))[0].studyDate
      : null;
    
    // Recalculate streak
    await updateStreak(req.user._id);
    
    // Update or create stats
    const updatedStats = await StudyStats.findByIdAndUpdate(
      req.user._id,
      {
        totalMinutes,
        totalSessions,
        averageSessionMinutes,
        lastStudyDate,
      },
      { upsert: true, new: true }
    );
    
    res.json({ 
      message: 'Stats recalculated successfully',
      stats: updatedStats 
    });
  } catch (error) {
    console.error('Error recalculating stats:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// STUDY SESSIONS
// ============================================

// @desc    Create study session
// @route   POST /api/study/sessions
// @access  Private
exports.createStudySession = async (req, res) => {
  try {
    const { subject, startTime, endTime, durationMinutes, goal } = req.body;

    const sessionDate = new Date(startTime);
    const session = await StudySession.create({
      userId: req.user._id,
      subject,
      startTime,
      endTime,
      durationMinutes,
      goal: goal || '',
      studyDate: sessionDate,
      dayOfWeek: sessionDate.toLocaleDateString('en-US', { weekday: 'long' }),
    });

    // Update stats
    const stats = await StudyStats.findById(req.user._id);
    const newTotalSessions = (stats?.totalSessions || 0) + 1;
    const newTotalMinutes = (stats?.totalMinutes || 0) + durationMinutes;
    const newAverageSessionMinutes = Math.round(newTotalMinutes / newTotalSessions);

    await StudyStats.findByIdAndUpdate(
      req.user._id,
      {
        $inc: { totalMinutes: durationMinutes, totalSessions: 1 },
        lastStudyDate: new Date(),
        averageSessionMinutes: newAverageSessionMinutes,
      },
      { upsert: true, new: true }
    );

    // Update streak history
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await StreakHistory.findOneAndUpdate(
      { userId: req.user._id, date: today },
      { studied: true },
      { upsert: true, new: true }
    );

    // Calculate and update streak
    await updateStreak(req.user._id);

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user study sessions
// @route   GET /api/study/sessions
// @access  Private
exports.getStudySessions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const sessions = await StudySession.find({ userId: req.user._id })
      .sort({ studyDate: -1 })
      .limit(limit);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's study sessions
// @route   GET /api/study/sessions/today
// @access  Private
exports.getTodaysSessions = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessions = await StudySession.find({
      userId: req.user._id,
      studyDate: { $gte: today, $lt: tomorrow }
    }).sort({ studyDate: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// STUDY PLANS
// ============================================

// @desc    Get today's study plans
// @route   GET /api/study/plans/today
// @access  Private
exports.getTodaysPlans = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const plans = await StudyPlan.find({
      userId: req.user._id,
      date: { $gte: today, $lt: tomorrow }
    }).sort({ createdAt: 1 });

    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create study plan
// @route   POST /api/study/plans
// @access  Private
exports.createStudyPlan = async (req, res) => {
  try {
    const { title, targetMinutes, date } = req.body;

    const plan = await StudyPlan.create({
      userId: req.user._id,
      title,
      targetMinutes,
      date: date || new Date(),
      completed: false,
    });

    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update study plan
// @route   PUT /api/study/plans/:id
// @access  Private
exports.updateStudyPlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const { title, targetMinutes, completed } = req.body;

    if (title !== undefined) plan.title = title;
    if (targetMinutes !== undefined) plan.targetMinutes = targetMinutes;
    if (completed !== undefined) plan.completed = completed;

    await plan.save();

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle plan completion
// @route   PATCH /api/study/plans/:id/toggle
// @access  Private
exports.togglePlanCompletion = async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    plan.completed = !plan.completed;
    await plan.save();

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete study plan
// @route   DELETE /api/study/plans/:id
// @access  Private
exports.deleteStudyPlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    await plan.deleteOne();

    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// WEEKLY PROGRESS
// ============================================

// @desc    Get weekly progress
// @route   GET /api/study/weekly-progress
// @access  Private
exports.getWeeklyProgress = async (req, res) => {
  try {
    // Get current week dates (Monday to Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 7);

    // Get sessions for current week
    const sessions = await StudySession.find({
      userId: req.user._id,
      studyDate: { $gte: monday, $lt: sunday }
    });

    // Initialize weekly data
    const weeklyData = [
      { day: 'Mon', hours: 0 },
      { day: 'Tue', hours: 0 },
      { day: 'Wed', hours: 0 },
      { day: 'Thu', hours: 0 },
      { day: 'Fri', hours: 0 },
      { day: 'Sat', hours: 0 },
      { day: 'Sun', hours: 0 }
    ];

    // Calculate hours for each day
    sessions.forEach(session => {
      const sessionDay = new Date(session.studyDate).getDay();
      const dayIndex = sessionDay === 0 ? 6 : sessionDay - 1;
      const hours = session.durationMinutes / 60;
      weeklyData[dayIndex].hours += hours;
    });

    // Round hours
    weeklyData.forEach(day => {
      day.hours = Math.round(day.hours * 10) / 10;
    });

    res.json(weeklyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Update streak
async function updateStreak(userId) {
  try {
    const streakHistory = await StreakHistory.find({ userId, studied: true })
      .sort({ date: -1 });

    if (streakHistory.length === 0) {
      await StudyStats.findByIdAndUpdate(userId, { currentStreak: 0 });
      return;
    }

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < streakHistory.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      const historyDate = new Date(streakHistory[i].date);
      historyDate.setHours(0, 0, 0, 0);

      if (historyDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    await StudyStats.findByIdAndUpdate(userId, { currentStreak: streak });
  } catch (error) {
    console.error('Error updating streak:', error);
  }
}