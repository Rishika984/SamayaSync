import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

function SessionLog() {
  const [todaysSessions, setTodaysSessions] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Function to generate random gradient colors for session headers
  const getRandomColor = () => {
    const gradients = [
      'linear-gradient(135deg, #FFA07A 0%, #FF8C69 50%, #FF7F50 100%)', // Light Salmon gradient
      'linear-gradient(135deg, #87CEEB 0%, #87CEFA 50%, #B0E0E6 100%)', // Sky Blue gradient
      'linear-gradient(135deg, #FF9999 0%, #FFB6C1 50%, #FFC0CB 100%)', // Pink gradient
      'linear-gradient(135deg, #90EE90 0%, #98FB98 50%, #F0FFF0 100%)', // Light Green gradient
      'linear-gradient(135deg, #DDA0DD 0%, #E6E6FA 50%, #F8F8FF 100%)', // Plum gradient
      'linear-gradient(135deg, #F0E68C 0%, #FFFFE0 50%, #FFFACD 100%)', // Khaki gradient
      'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 50%, #FFE4E1 100%)', // Light Pink gradient
      'linear-gradient(135deg, #98FB98 0%, #AFEEEE 50%, #E0FFFF 100%)'  // Pale Green gradient
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  // Function to format duration with proper units (minutes or hours)
  const formatDuration = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours}${hours === 1 ? ' hour' : ' hours'}`;
      } else {
        return `${hours}h ${remainingMinutes}min`;
      }
    } else {
      return `${minutes} min`;
    }
  };

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
                    style={{ background: session.color || getRandomColor() }}
                  />
                  <div className="figma-session-body">
                    <div className="figma-session-subject">{session.subject.toUpperCase()}</div>
                    <div className="figma-session-hours">{formatDuration(session.duration)}</div>
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