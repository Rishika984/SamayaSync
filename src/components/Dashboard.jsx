import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import StartPrompt from './StartPrompt';
import Sidebar from './Sidebar';
import StatCard from './StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const location = useLocation();
  const showOnboard = location?.state?.showOnboard;
  const [promptOpen, setPromptOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [todaysPlan, setTodaysPlan] = useState([]);
  const [stats, setStats] = useState({
    totalStudyHours: '0h',
    sessionsCompleted: 0,
    streakDays: 0,
    averageSessionTime: '0 min'
  });

  const loadTodaysPlans = () => {
    const today = new Date().toDateString();
    const savedPlans = JSON.parse(localStorage.getItem('dailyPlans') || '{}');
    setTodaysPlan(savedPlans[today] || []);
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

    // Listen for storage changes to update stats when sessions are completed
    const handleStorageChange = (e) => {
      if (e.key === 'completedSessions') {
        calculateStats();
        calculateWeeklyProgress();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for changes periodically in case of same-tab updates
    const interval = setInterval(calculateStats, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [showOnboard, calculateStats, calculateWeeklyProgress]);

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
      <Sidebar isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
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
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#fff', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="hours" fill="#a78bfa" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="todays-plan-section">
            <h2 className="section-title">Today's Plan</h2>
            <div className="plan-list">
              {todaysPlan.length === 0 ? (
                <div className="no-plans">No plans for today</div>
              ) : (
                todaysPlan.map((item) => (
                  <div key={item.id} className="plan-item">
                    <div className="plan-info">
                      <div className="plan-subject">{item.subject}</div>
                      <div className="plan-time">{item.time}</div>
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
    </div>
  );
}

export default Dashboard;