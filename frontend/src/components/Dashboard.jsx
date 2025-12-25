import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

  const loadTodaysPlans = useCallback(() => {
    const today = new Date().toDateString();
    const savedPlans = JSON.parse(localStorage.getItem('dailyPlans') || '{}');
    const plans = savedPlans[today] || [];
    
    // Sort plans by time (convert to 24-hour format for sorting)
    const sortedPlans = plans.sort((a, b) => {
      const timeA = convertTo24Hour(a.time);
      const timeB = convertTo24Hour(b.time);
      return timeA.localeCompare(timeB);
    });
    
    setTodaysPlan(sortedPlans);
  }, []);

  // Helper function to convert time to 24-hour format for sorting
  const convertTo24Hour = (timeStr) => {
    try {
      const time = timeStr.toLowerCase().trim();
      let [timePart, period] = time.split(/\s+/);
      let [hours, minutes] = timePart.split(':');
      
      hours = parseInt(hours);
      minutes = minutes ? parseInt(minutes) : 0;
      
      if (period) {
        if (period.includes('pm') && hours !== 12) hours += 12;
        if (period.includes('am') && hours === 12) hours = 0;
      }
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (e) {
      return timeStr; // Return original if parsing fails
    }
  };

  // Add a new plan
  const addPlan = () => {
    if (!newPlan.subject.trim() || !newPlan.expectedDuration) return;
    
    const today = new Date().toDateString();
    const savedPlans = JSON.parse(localStorage.getItem('dailyPlans') || '{}');
    
    const planToAdd = {
      id: Date.now(),
      subject: newPlan.subject.trim(),
      expectedDuration: parseInt(newPlan.expectedDuration),
      completed: false,
      actualDuration: 0,
      createdAt: new Date().toISOString()
    };
    
    if (!savedPlans[today]) {
      savedPlans[today] = [];
    }
    savedPlans[today].push(planToAdd);
    
    localStorage.setItem('dailyPlans', JSON.stringify(savedPlans));
    setTodaysPlan(savedPlans[today]);
    
    // Reset form
    setNewPlan({ subject: '', expectedDuration: 60 });
    setPlanFormOpen(false);
  };

  // Delete a plan
  const deletePlan = (planId) => {
    const today = new Date().toDateString();
    const savedPlans = JSON.parse(localStorage.getItem('dailyPlans') || '{}');
    
    if (savedPlans[today]) {
      savedPlans[today] = savedPlans[today].filter(plan => plan.id !== planId);
      localStorage.setItem('dailyPlans', JSON.stringify(savedPlans));
      setTodaysPlan(savedPlans[today]);
    }
  };

  // Toggle plan completion
  const togglePlanComplete = (planId) => {
    const today = new Date().toDateString();
    const savedPlans = JSON.parse(localStorage.getItem('dailyPlans') || '{}');
    
    if (savedPlans[today]) {
      savedPlans[today] = savedPlans[today].map(plan => 
        plan.id === planId ? { ...plan, completed: !plan.completed } : plan
      );
      localStorage.setItem('dailyPlans', JSON.stringify(savedPlans));
      setTodaysPlan(savedPlans[today]);
    }
  };



  // Calculate actual study time for a plan
  const calculateActualStudyTime = (planSubject) => {
    const completedSessions = JSON.parse(localStorage.getItem('completedSessions') || '[]');
    const today = new Date().toDateString();
    
    return completedSessions
      .filter(session => {
        const sessionDate = new Date(session.date).toDateString();
        return sessionDate === today && session.subject.toLowerCase() === planSubject.toLowerCase();
      })
      .reduce((total, session) => total + session.duration, 0);
  };

  // Update plan progress based on completed sessions
  const updatePlanProgress = useCallback(() => {
    const today = new Date().toDateString();
    const savedPlans = JSON.parse(localStorage.getItem('dailyPlans') || '{}');
    
    if (savedPlans[today]) {
      savedPlans[today] = savedPlans[today].map(plan => {
        const actualDuration = calculateActualStudyTime(plan.subject);
        const isCompleted = actualDuration >= plan.expectedDuration;
        
        return {
          ...plan,
          actualDuration,
          completed: isCompleted
        };
      });
      
      localStorage.setItem('dailyPlans', JSON.stringify(savedPlans));
      setTodaysPlan(savedPlans[today]);
    }
  }, []);

  // Format duration for display
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

  // Get completion percentage for a plan
  const getCompletionPercentage = (actualDuration, expectedDuration) => {
    return Math.min(100, Math.round((actualDuration / expectedDuration) * 100));
  };

  // Start study session from plan
  const startSessionFromPlan = (planItem) => {
    // Navigate to ActiveSession with pre-filled subject
    navigate('/active-session', { 
      state: { 
        prefilledSubject: planItem.subject,
        fromPlan: true,
        planId: planItem.id
      } 
    });
  };

  const calculateWeeklyProgress = useCallback(() => {
    const completedSessions = JSON.parse(localStorage.getItem('completedSessions') || '[]');
    
    // Get current week dates (Monday to Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Calculate offset to Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    
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
    
    // Calculate hours for each day of the current week
    completedSessions.forEach(session => {
      const sessionDate = new Date(session.completedAt);
      const sessionDay = sessionDate.getDay();
      
      // Check if session is within current week
      const weekStart = new Date(monday);
      const weekEnd = new Date(monday);
      weekEnd.setDate(monday.getDate() + 6);
      
      if (sessionDate >= weekStart && sessionDate <= weekEnd) {
        // Convert day index (0=Sunday, 1=Monday) to our array index (0=Monday, 6=Sunday)
        const dayIndex = sessionDay === 0 ? 6 : sessionDay - 1;
        const hours = session.duration / 60; // Convert minutes to hours
        weeklyData[dayIndex].hours += hours;
      }
    });
    
    // Round hours to 1 decimal place
    weeklyData.forEach(day => {
      day.hours = Math.round(day.hours * 10) / 10;
    });
    
    setProgressData(weeklyData);
  }, []);

  const calculateStreakDays = useCallback((sessions) => {
    if (sessions.length === 0) return 0;
    
    // Group sessions by date
    const sessionsByDate = {};
    sessions.forEach(session => {
      const date = new Date(session.completedAt).toDateString();
      if (!sessionsByDate[date]) {
        sessionsByDate[date] = [];
      }
      sessionsByDate[date].push(session);
    });
    
    // Get unique dates and sort them
    const dates = Object.keys(sessionsByDate).sort((a, b) => new Date(b) - new Date(a));
    
    if (dates.length === 0) return 0;
    
    // Check for consecutive days starting from today
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < dates.length; i++) {
      const currentDate = new Date(dates[i]);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (currentDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }, []);

  const calculateStats = useCallback(() => {
    const completedSessions = JSON.parse(localStorage.getItem('completedSessions') || '[]');
    const today = new Date().toDateString();
    
    // Get today's sessions
    const todaySessions = completedSessions.filter(session => 
      new Date(session.completedAt).toDateString() === today
    );
    
    // Calculate total study hours for today
    const totalMinutesToday = todaySessions.reduce((total, session) => {
      return total + session.duration;
    }, 0);
    
    const hours = Math.floor(totalMinutesToday / 60);
    const minutes = totalMinutesToday % 60;
    const totalStudyHours = hours > 0 ? 
      (minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`) : 
      (minutes > 0 ? `${minutes}m` : '0h');
    
    // Sessions completed today
    const sessionsCompleted = todaySessions.length;
    
    // Calculate average session time for today
    const averageMinutes = sessionsCompleted > 0 ? Math.round(totalMinutesToday / sessionsCompleted) : 0;
    const averageSessionTime = averageMinutes > 0 ? `${averageMinutes} min` : '0 min';
    
    // Calculate streak days
    const streakDays = calculateStreakDays(completedSessions);
    
    setStats({
      totalStudyHours,
      sessionsCompleted,
      streakDays,
      averageSessionTime
    });
    
    // Update weekly progress chart
    calculateWeeklyProgress();
  }, [calculateStreakDays, calculateWeeklyProgress]);

  useEffect(() => {
    if (showOnboard) setPromptOpen(true);
    loadTodaysPlans();
    calculateStats();
    updatePlanProgress();

    // Listen for storage changes to update stats when sessions are completed
    const handleStorageChange = (e) => {
      if (e.key === 'completedSessions') {
        calculateStats();
        calculateWeeklyProgress();
        updatePlanProgress(); // Update plan progress when new sessions are completed
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for changes periodically in case of same-tab updates
    const interval = setInterval(calculateStats, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [showOnboard, calculateStats, calculateWeeklyProgress, loadTodaysPlans, updatePlanProgress]);

  const [progressData, setProgressData] = useState([
    { day: 'Mon', hours: 0 },
    { day: 'Tue', hours: 0 },
    { day: 'Wed', hours: 0 },
    { day: 'Thu', hours: 0 },
    { day: 'Fri', hours: 0 },
    { day: 'Sat', hours: 0 },
    { day: 'Sun', hours: 0 }
  ]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
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
            <h2 className="section-title">Progress</h2>
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
                  //  cursor={{ fill: '#080809ff', opacity: 0.5 }}
                    contentStyle={{ 
                      background: '#fff', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Bar dataKey="hours" fill="#a78bfa" radius={[8, 8, 0, 0]}  />
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
                  <div key={item.id} className={`plan-item ${item.completed ? 'completed' : ''}`}>
                    <div className="plan-checkbox">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => togglePlanComplete(item.id)}
                        id={`plan-${item.id}`}
                      />
                      <label htmlFor={`plan-${item.id}`} className="checkbox-custom"></label>
                    </div>
                    <div className="plan-info">
                      <div className="plan-subject">{item.subject}</div>
                      <div className="plan-progress-section">
                        <div className="plan-progress-bar">
                          <div 
                            className="plan-progress-fill"
                            style={{ 
                              width: `${getCompletionPercentage(item.actualDuration || 0, item.expectedDuration)}%`
                            }}
                          ></div>
                        </div>
                        <div className="plan-progress-text">
                          {formatDuration(item.actualDuration || 0)} / {formatDuration(item.expectedDuration)}
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
                        onClick={() => deletePlan(item.id)}
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

      {/* Plan Form Modal */}
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