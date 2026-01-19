const express = require('express');
const router = express.Router();
const {
  getStudyStats,
  recalculateStats,
  createStudySession,
  getStudySessions,
  getTodaysSessions,
  getTodaysPlans,
  createStudyPlan,
  updateStudyPlan,
  togglePlanCompletion,
  deleteStudyPlan,
  getWeeklyProgress,
} = require('../controllers/studyController');
const { protect } = require('../middleware/authMiddleware');

// Stats
router.get('/stats', protect, getStudyStats);
router.post('/stats/recalculate', protect, recalculateStats);

// Sessions
router.post('/sessions', protect, createStudySession);
router.get('/sessions', protect, getStudySessions);
router.get('/sessions/today', protect, getTodaysSessions);

// Plans
router.get('/plans/today', protect, getTodaysPlans);
router.post('/plans', protect, createStudyPlan);
router.put('/plans/:id', protect, updateStudyPlan);
router.patch('/plans/:id/toggle', protect, togglePlanCompletion);
router.delete('/plans/:id', protect, deleteStudyPlan);

// Weekly progress
router.get('/weekly-progress', protect, getWeeklyProgress);

module.exports = router;