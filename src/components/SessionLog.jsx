import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

function SessionLog() {
  const [todaysSessions, setTodaysSessions] = useState([]);

  // Load only today's completed sessions from localStorage
  useEffect(() => {
    const loadTodaysSessions = () => {
      const savedSessions = localStorage.getItem('completedSessions');
      if (savedSessions) {
        const allSessions = JSON.parse(savedSessions);
        const today = new Date().toDateString();
        
        // Filter sessions to only include today's sessions
        const todaysSessionsOnly = allSessions.filter(session => {
          const sessionDate = new Date(session.completedAt).toDateString();
          return sessionDate === today;
        });
        
        setTodaysSessions(todaysSessionsOnly);
      }
    };

    loadTodaysSessions();

    // Listen for storage changes to update when new sessions are completed
    const handleStorageChange = (e) => {
      if (e.key === 'completedSessions') {
        loadTodaysSessions();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for changes periodically in case of same-tab updates
    const interval = setInterval(loadTodaysSessions, 30000); // Check every 30 seconds

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Function to generate random colors for session headers
  const getRandomColor = () => {
    const colors = ['#FFA07A', '#87CEEB', '#FF9999', '#90EE90', '#DDA0DD', '#F0E68C', '#FFB6C1', '#98FB98'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="session-log-container">
          {todaysSessions.length === 0 ? (
            <div className="empty-sessions">
              <h2>No Sessions Completed Today</h2>
              <p>Complete your first study session today to see it appear here!</p>
            </div>
          ) : (
            <div className="session-log-grid">
              {todaysSessions.map((session, index) => (
                <div key={index} className="figma-session-card">
                  <div 
                    className="figma-session-header" 
                    style={{ backgroundColor: session.color || getRandomColor() }}
                  />
                  <div className="figma-session-body">
                    <div className="figma-session-subject">{session.subject.toUpperCase()}</div>
                    <div className="figma-session-hours">{session.duration}</div>
                    <div className="figma-session-date">{session.date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default SessionLog;