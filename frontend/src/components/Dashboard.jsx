import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getStudyStats, recalculateStats, getStudySessions, getTodaysPlans, createStudyPlan, togglePlanCompletion, deleteStudyPlan } from './services/studyService';
import StartPrompt from './StartPrompt';
import Sidebar from './Sidebar';
import StatCard from './StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Dashboard({ darkMode, setDarkMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const showOnboard = location?.state?.showOnboard;
  const [promptOpen, setPromptOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [todaysPlan, setTodaysPlan] = useState([]);
  const [planFormOpen, setPlanFormOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [newPlan, setNewPlan] = useState({
    subject: '',
    expectedDuration: 60 
  });
  const [stats, setStats] = useState({
    totalStudyHours: '0h',
    sessionsCompleted: 0,
    streakDays: 0,
    averageSessionTime: '0 min'
  });
  const [progressData, setProgressData] = useState([
    { day: 'Sun', hours: 0 },
    { day: 'Mon', hours: 0 },
    { day: 'Tue', hours: 0 },
    { day: 'Wed', hours: 0 },
    { day: 'Thu', hours: 0 },
    { day: 'Fri', hours: 0 },
    { day: 'Sat', hours: 0 }
  ]);

  const loadTodaysPlans = useCallback(async () => {
    try {
      const plans = await getTodaysPlans();
      setTodaysPlan(plans);
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  }, []);

  const addPlan = async () => {
    if (!newPlan.subject.trim() || !newPlan.expectedDuration) return;
    
    try {
      await createStudyPlan({
        title: newPlan.subject.trim(),
        targetMinutes: parseInt(newPlan.expectedDuration),
        date: new Date(),
      });
      
      setNewPlan({ subject: '', expectedDuration: 60 });
      setPlanFormOpen(false);
      loadTodaysPlans();
    } catch (error) {
      console.error('Error adding plan:', error);
      alert('Failed to add plan. Please try again.');
    }
  };

  const deletePlan = async (planId) => {
    try {
      await deleteStudyPlan(planId);
      loadTodaysPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Failed to delete plan. Please try again.');
    }
  };

  const togglePlanComplete = async (planId) => {
    try {
      await togglePlanCompletion(planId);
      loadTodaysPlans();
    } catch (error) {
      console.error('Error toggling plan:', error);
      alert('Failed to update plan. Please try again.');
    }
  };

  const formatDuration = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h ${remainingMinutes}m`;
      }
    } else {
      return `${minutes}m`;
    }
  };

  const getCompletionPercentage = (actualDuration, expectedDuration) => {
    return Math.min(100, Math.round((actualDuration / expectedDuration) * 100));
  };

  const startSessionFromPlan = (planItem) => {
    navigate('/active-session', { 
      state: { 
        prefilledSubject: planItem.title,
        fromPlan: true,
        planId: planItem._id
      } 
    });
  };

  const getWeekDates = (offset) => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday
    
    // Calculate Sunday of the current week
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - currentDay + (offset * 7));
    sunday.setHours(0, 0, 0, 0);
    
    // Calculate Saturday (end of week)
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 7);
    
    return { sunday, saturday };
  };

  const getWeekLabel = (offset) => {
    if (offset === 0) return 'This Week';
    if (offset === -1) return 'Last Week';
    
    const { sunday, saturday } = getWeekDates(offset);
    const saturdayEnd = new Date(saturday);
    saturdayEnd.setDate(saturdayEnd.getDate() - 1);
    
    const format = (date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    return `${format(sunday)} - ${format(saturdayEnd)}`;
  };

  const calculateWeeklyProgress = useCallback(async () => {
    try {
      const allSessions = await getStudySessions(200);
      const { sunday, saturday } = getWeekDates(weekOffset);
      
      // Filter sessions for this week
      const weekSessions = allSessions.filter(session => {
        const sessionDate = new Date(session.studyDate);
        return sessionDate >= sunday && sessionDate < saturday;
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
      weekSessions.forEach(session => {
        const sessionDay = new Date(session.studyDate).getDay(); // 0 = Sunday
        const hours = session.durationMinutes / 60;
        weeklyData[sessionDay].hours += hours;
      });
      
      // Round hours
      weeklyData.forEach(day => {
        day.hours = Math.round(day.hours * 10) / 10;
      });
      
      setProgressData(weeklyData);
    } catch (error) {
      console.error('Error loading weekly progress:', error);
    }
  }, [weekOffset]);

  const calculateStats = useCallback(async () => {
    try {
      const statsData = await getStudyStats();
      
      const totalMinutes = statsData.totalMinutes || 0;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      let totalStudyHours;
      if (hours > 0 && minutes > 0) {
        totalStudyHours = `${hours}h ${minutes}m`;
      } else if (hours > 0) {
        totalStudyHours = `${hours}h`;
      } else if (minutes > 0) {
        totalStudyHours = `${minutes}m`;
      } else {
        totalStudyHours = '0m';
      }
      
      const sessionsCompleted = statsData.totalSessions || 0;
      const averageMinutes = statsData.averageSessionMinutes || 0;
      const averageSessionTime = averageMinutes > 0 ? `${averageMinutes} min` : '0 min';
      const streakDays = statsData.currentStreak || 0;
      
      setStats({
        totalStudyHours,
        sessionsCompleted,
        streakDays,
        averageSessionTime
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  useEffect(() => {
    const initializeDashboard = async () => {
      if (showOnboard) setPromptOpen(true);
      
      // Recalculate stats on component mount to ensure accuracy
      try {
        await recalculateStats();
      } catch (error) {
        console.error('Error recalculating stats:', error);
      }
      
      loadTodaysPlans();
      calculateStats();
      calculateWeeklyProgress();
    };

    initializeDashboard();

    const interval = setInterval(() => {
      calculateStats();
      calculateWeeklyProgress();
      loadTodaysPlans();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [showOnboard, calculateStats, calculateWeeklyProgress, loadTodaysPlans]);

  // Re-calculate weekly progress when week offset changes
  useEffect(() => {
    calculateWeeklyProgress();
  }, [weekOffset, calculateWeeklyProgress]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const goToPreviousWeek = () => {
    setWeekOffset(prev => prev - 1);
  };

  const goToNextWeek = () => {
    if (weekOffset < 0) {
      setWeekOffset(prev => prev + 1);
    }
  };

  const goToCurrentWeek = () => {
    setWeekOffset(0);
  };

  return (
    <div className="dashboard-layout">
      <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        ☰
      </button>
      {isMobileMenuOpen && <div className="sidebar-overlay active" onClick={closeMobileMenu}></div>}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        darkMode={darkMode}
        toggleDark={() => setDarkMode(prev => !prev)}
      />

      <main className="dashboard-main">
        <div className="dashboard-stats">
          <StatCard 
            icon="📚" 
            value={stats.totalStudyHours} 
            label="Total study hours" 
          />
          <StatCard 
            icon="✓" 
            value={stats.sessionsCompleted.toString()} 
            label="Sessions Completed" 
          />
          <StatCard 
            icon="🔥" 
            value={stats.streakDays.toString()} 
            label="Streak Days"
            tooltip="Complete at least 1 hour of study to earn a streak day. Keep it up!"
          />
          <StatCard 
            icon="🕐" 
            value={stats.averageSessionTime} 
            label="Average Session time" 
          />
        </div>

        <div className="dashboard-content">
          <div className="progress-section">
            <div className="progress-header">
              <h2 className="section-title">Progress</h2>
              <div className="week-navigation">
                <button 
                  className="week-nav-btn"
                  onClick={goToPreviousWeek}
                  title="Previous week"
                >
                  ←
                </button>
                <span className="week-label">{getWeekLabel(weekOffset)}</span>
                <button 
                  className="week-nav-btn"
                  onClick={goToNextWeek}
                  disabled={weekOffset === 0}
                  title="Next week"
                >
                  →
                </button>
                {weekOffset !== 0 && (
                  <button 
                    className="week-current-btn"
                    onClick={goToCurrentWeek}
                    title="Go to current week"
                  >
                    Current Week
                  </button>
                )}
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={progressData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#64748b"
                    fontSize={12}
                    tickMargin={5}
                    interval={0}
                  />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#fff', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Bar dataKey="hours" fill="#a78bfa" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="todays-plan-section">
            <div className="plan-header">
              <div className="plan-title-section">
                <h2 className="section-title">Today's Plan</h2>
                {todaysPlan.length > 0 && (
                  <div className="plan-progress">
                    <div className="plan-stats">
                      <span className="completed-plans">
                        {todaysPlan.filter(p => p.completed).length}/{todaysPlan.length} completed
                      </span>
                      <span className="plan-status">
                        {todaysPlan.every(p => p.completed) ? (
                          <span className="all-completed">🎉 All plans achieved!</span>
                        ) : todaysPlan.some(p => p.completed) ? (
                          <span className="some-completed">💪 Keep going!</span>
                        ) : (
                          <span className="none-completed">📚 Let's get started!</span>
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <button 
                className="add-plan-btn"
                onClick={() => setPlanFormOpen(true)}
                title="Add new plan"
              >
                +
              </button>
            </div>
            <div className="plan-list">
              {todaysPlan.length === 0 ? (
                <div className="no-plans">
                  <p>No plans for today</p>
                  <button 
                    className="add-first-plan-btn"
                    onClick={() => setPlanFormOpen(true)}
                  >
                    Create your first plan
                  </button>
                </div>
              ) : (
                todaysPlan.map((item) => (
                  <div key={item._id} className={`plan-item ${item.completed ? 'completed' : ''}`}>
                    <div className="plan-checkbox">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => togglePlanComplete(item._id)}
                        id={`plan-${item._id}`}
                      />
                      <label htmlFor={`plan-${item._id}`} className="checkbox-custom"></label>
                    </div>
                    <div className="plan-info">
                      <div className="plan-subject">{item.title}</div>
                      <div className="plan-progress-section">
                        <div className="plan-progress-bar">
                          <div 
                            className="plan-progress-fill"
                            style={{ 
                              width: `${getCompletionPercentage(item.actualDuration || 0, item.targetMinutes)}%`
                            }}
                          ></div>
                        </div>
                        <div className="plan-progress-text">
                          {formatDuration(item.actualDuration || 0)} / {formatDuration(item.targetMinutes)}
                          {item.completed && <span className="plan-success"> ✅</span>}
                        </div>
                      </div>
                    </div>
                    <div className="plan-actions">
                      <button 
                        className="start-session-btn"
                        onClick={() => startSessionFromPlan(item)}
                        title="Start study session"
                        disabled={item.completed}
                      >
                        ▶️
                      </button>
                      <button 
                        className="delete-plan-btn"
                        onClick={() => deletePlan(item._id)}
                        title="Delete plan"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      
      <StartPrompt 
        open={promptOpen} 
        onConfirm={() => setPromptOpen(false)} 
        onCancel={() => setPromptOpen(false)} 
      />

      {planFormOpen && (
        <div className="plan-modal-overlay" onClick={() => setPlanFormOpen(false)}>
          <div className="plan-modal" onClick={(e) => e.stopPropagation()}>
            <div className="plan-modal-header">
              <h3>Add New Plan</h3>
              <button 
                className="plan-modal-close"
                onClick={() => setPlanFormOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="plan-modal-body">
              <div className="plan-form-group">
                <label htmlFor="plan-subject">Subject *</label>
                <input
                  id="plan-subject"
                  type="text"
                  placeholder="e.g., Mathematics, Physics"
                  value={newPlan.subject}
                  onChange={(e) => setNewPlan({...newPlan, subject: e.target.value})}
                />
              </div>
              <div className="plan-form-group">
                <label htmlFor="plan-duration">Expected Study Time *</label>
                <select
                  id="plan-duration"
                  value={newPlan.expectedDuration}
                  onChange={(e) => setNewPlan({...newPlan, expectedDuration: parseInt(e.target.value)})}
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={150}>2.5 hours</option>
                  <option value={180}>3 hours</option>
                  <option value={240}>4 hours</option>
                </select>
              </div>
            </div>
            <div className="plan-modal-footer">
              <button 
                className="plan-btn plan-btn-cancel"
                onClick={() => setPlanFormOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="plan-btn plan-btn-add"
                onClick={addPlan}
                disabled={!newPlan.subject.trim() || !newPlan.expectedDuration}
              >
                Add Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
