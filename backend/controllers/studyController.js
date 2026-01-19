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

// @desc    Recalculate ALL user study data from sessions
// @route   POST /api/study/stats/recalculate
// @access  Private
exports.recalculateStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all sessions for this user
    const sessions = await StudySession.find({ userId }).sort({ studyDate: 1 });
    
    if (sessions.length === 0) {
      // Reset stats to zero
      await StudyStats.findByIdAndUpdate(
        userId,
        {
          totalMinutes: 0,
          totalSessions: 0,
          currentStreak: 0,
          averageSessionMinutes: 0,
          lastStudyDate: null
        },
        { upsert: true, new: true }
      );
      
      return res.json({ 
        message: 'No sessions found - stats reset to zero',
        stats: {
          totalMinutes: 0,
          totalSessions: 0,
          currentStreak: 0,
          averageSessionMinutes: 0,
          lastStudyDate: null
        }
      });
    }
    
    // 1. Calculate totals from actual sessions
    const totalMinutes = sessions.reduce((sum, session) => sum + (session.durationMinutes || 0), 0);
    const totalSessions = sessions.length;
    const averageSessionMinutes = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
    
    // 2. Get last study date
    const lastStudyDate = new Date(sessions[sessions.length - 1].studyDate);
    
    // 3. Rebuild StreakHistory from all sessions
    await StreakHistory.deleteMany({ userId }); // Clear old data
    
    // Group sessions by date
    const sessionsByDate = {};
    sessions.forEach(session => {
      const dateKey = new Date(session.studyDate);
      dateKey.setHours(0, 0, 0, 0);
      const dateString = dateKey.toISOString();
      
      if (!sessionsByDate[dateString]) {
        sessionsByDate[dateString] = [];
      }
      sessionsByDate[dateString].push(session);
    });
    
    // Create StreakHistory entries for each day with sessions
    const streakPromises = Object.entries(sessionsByDate).map(([dateString]) => {
      return StreakHistory.create({
        userId,
        date: new Date(dateString),
        studied: true
      });
    });
    
    await Promise.all(streakPromises);
    
    // 4. Calculate streak
    const currentStreak = await calculateStreakFromHistory(userId);
    
    // 5. Update StudyStats
    const updatedStats = await StudyStats.findByIdAndUpdate(
      userId,
      {
        totalMinutes,
        totalSessions,
        averageSessionMinutes,
        lastStudyDate,
        currentStreak
      },
      { upsert: true, new: true }
    );
    
    res.json({ 
      message: 'All stats recalculated successfully from sessions',
      stats: updatedStats,
      streakDaysCreated: Object.keys(sessionsByDate).length
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
    
    // Create the session
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

    // ===== AUTO-UPDATE ALL RELATED COLLECTIONS =====
    
    // 1. Update StudyStats
    await updateStudyStats(req.user._id, durationMinutes);
    
    // 2. Update StreakHistory
    await updateStreakHistory(req.user._id, sessionDate);
    
    // 3. Update Streak Count
    await updateStreak(req.user._id);
    
    // 4. Update StudyPlans (mark as completed if target reached)
    await updateStudyPlans(req.user._id, subject, durationMinutes, sessionDate);

    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating session:', error);
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

// @desc    Get today's study plans with actual progress
// @route   GET /api/study/plans/today
// @access  Private
exports.getTodaysPlans = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's plans
    const plans = await StudyPlan.find({
      userId: req.user._id,
      date: { $gte: today, $lt: tomorrow }
    }).sort({ createdAt: 1 });

    // Get today's sessions to calculate actual progress
    const todaysSessions = await StudySession.find({
      userId: req.user._id,
      studyDate: { $gte: today, $lt: tomorrow }
    });

    // Calculate actual duration for each plan based on matching subjects (case-insensitive)
    const plansWithProgress = plans.map(plan => {
      const matchingSessions = todaysSessions.filter(session => 
        session.subject.toLowerCase() === plan.title.toLowerCase()
      );
      
      const actualDuration = matchingSessions.reduce(
        (sum, session) => sum + session.durationMinutes, 
        0
      );

      return {
        ...plan.toObject(),
        actualDuration,
        completed: actualDuration >= plan.targetMinutes
      };
    });

    res.json(plansWithProgress);
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
    // Get current week dates (Sunday to Saturday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    
    // Calculate Sunday of the current week
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0);
    
    // Calculate next Sunday (end of week)
    const nextSunday = new Date(sunday);
    nextSunday.setDate(sunday.getDate() + 7);

    // Get sessions for current week
    const sessions = await StudySession.find({
      userId: req.user._id,
      studyDate: { $gte: sunday, $lt: nextSunday }
    });

    // Initialize weekly data (Sunday to Saturday)
    const weeklyData = [
      { day: 'Sun', hours: 0 },
      { day: 'Mon', hours: 0 },
      { day: 'Tue', hours: 0 },
      { day: 'Wed', hours: 0 },
      { day: 'Thu', hours: 0 },
      { day: 'Fri', hours: 0 },
      { day: 'Sat', hours: 0 }
    ];

    // Calculate hours for each day
    sessions.forEach(session => {
      const sessionDay = new Date(session.studyDate).getDay(); // 0 = Sunday
      const hours = session.durationMinutes / 60;
      weeklyData[sessionDay].hours += hours;
    });

    // Round hours to 1 decimal place
    weeklyData.forEach(day => {
      day.hours = Math.round(day.hours * 10) / 10;
    });

    res.json(weeklyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// HELPER FUNCTIONS (AUTO-UPDATE SYSTEM)
// ============================================

// Update StudyStats when a new session is created
async function updateStudyStats(userId, durationMinutes) {
  try {
    const stats = await StudyStats.findById(userId);
    const newTotalSessions = (stats?.totalSessions || 0) + 1;
    const newTotalMinutes = (stats?.totalMinutes || 0) + durationMinutes;
    const newAverageSessionMinutes = Math.round(newTotalMinutes / newTotalSessions);

    await StudyStats.findByIdAndUpdate(
      userId,
      {
        totalMinutes: newTotalMinutes,
        totalSessions: newTotalSessions,
        lastStudyDate: new Date(),
        averageSessionMinutes: newAverageSessionMinutes,
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error updating study stats:', error);
  }
}

// Update StreakHistory when a new session is created
async function updateStreakHistory(userId, sessionDate) {
  try {
    const dateOnly = new Date(sessionDate);
    dateOnly.setHours(0, 0, 0, 0);
    
    await StreakHistory.findOneAndUpdate(
      { userId, date: dateOnly },
      { studied: true },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error updating streak history:', error);
  }
}

// Update StudyPlans - auto-complete if target reached
async function updateStudyPlans(userId, subject, durationMinutes, sessionDate) {
  try {
    const dateOnly = new Date(sessionDate);
    dateOnly.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(dateOnly);
    nextDay.setDate(nextDay.getDate() + 1);

    // Find matching plans for today (case-insensitive)
    const matchingPlans = await StudyPlan.find({
      userId,
      date: { $gte: dateOnly, $lt: nextDay },
      completed: false
    });

    // Filter plans that match the subject (case-insensitive)
    const subjectMatchingPlans = matchingPlans.filter(plan => 
      plan.title.toLowerCase() === subject.toLowerCase()
    );

    if (subjectMatchingPlans.length === 0) {
      return; // No matching plans to update
    }

    // Get today's sessions for this subject (case-insensitive)
    const todaysSessions = await StudySession.find({
      userId,
      studyDate: { $gte: dateOnly, $lt: nextDay }
    });

    const subjectSessions = todaysSessions.filter(session =>
      session.subject.toLowerCase() === subject.toLowerCase()
    );

    const totalMinutesForSubject = subjectSessions.reduce(
      (sum, session) => sum + session.durationMinutes,
      0
    );

    // Auto-complete plans if target reached
    for (const plan of subjectMatchingPlans) {
      if (totalMinutesForSubject >= plan.targetMinutes) {
        plan.completed = true;
        await plan.save();
      }
    }
  } catch (error) {
    console.error('Error updating study plans:', error);
  }
}

// Calculate streak from StreakHistory
async function calculateStreakFromHistory(userId) {
  try {
    const streakHistory = await StreakHistory.find({ userId, studied: true })
      .sort({ date: -1 });

    if (streakHistory.length === 0) {
      return 0;
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

    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}

// Update streak count in StudyStats
async function updateStreak(userId) {
  try {
    const streak = await calculateStreakFromHistory(userId);
    await StudyStats.findByIdAndUpdate(userId, { currentStreak: streak });
  } catch (error) {
    console.error('Error updating streak:', error);
  }
}