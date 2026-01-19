import API from './api';

// ============================================
// STUDY STATS
// ============================================

// Get user study stats
export const getStudyStats = async () => {
  try {
    const response = await API.get('/study/stats');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Recalculate study stats
export const recalculateStats = async () => {
  try {
    const response = await API.post('/study/stats/recalculate');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================
// STUDY SESSIONS
// ============================================

// Create study session
export const createStudySession = async (sessionData) => {
  try {
    const response = await API.post('/study/sessions', sessionData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all study sessions
export const getStudySessions = async (limit = 50) => {
  try {
    const response = await API.get(`/study/sessions?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get today's study sessions
export const getTodaysSessions = async () => {
  try {
    const response = await API.get('/study/sessions/today');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================
// STUDY PLANS
// ============================================

// Get today's study plans
export const getTodaysPlans = async () => {
  try {
    const response = await API.get('/study/plans/today');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create study plan
export const createStudyPlan = async (planData) => {
  try {
    const response = await API.post('/study/plans', planData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update study plan
export const updateStudyPlan = async (planId, planData) => {
  try {
    const response = await API.put(`/study/plans/${planId}`, planData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete study plan
export const deleteStudyPlan = async (planId) => {
  try {
    const response = await API.delete(`/study/plans/${planId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Toggle plan completion
export const togglePlanCompletion = async (planId) => {
  try {
    const response = await API.patch(`/study/plans/${planId}/toggle`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


// Get weekly progress data
export const getWeeklyProgress = async () => {
  try {
    const response = await API.get('/study/weekly-progress');
    return response.data;
  } catch (error) {
    throw error;
  }
};