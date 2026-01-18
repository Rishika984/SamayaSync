import React, { useState, useEffect } from 'react';
import { getTodaysSessions } from './services/studyService';
import Sidebar from './Sidebar';

function SessionLog({ darkMode, setDarkMode }) {
  const [todaysSessions, setTodaysSessions] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTodaysSessions = async () => {
      try {
        setLoading(true);
        const sessions = await getTodaysSessions();
        setTodaysSessions(sessions || []);
      } catch (error) {
        console.error('Error loading sessions:', error);
        setTodaysSessions([]);
      } finally {
        setLoading(false);
      }
    };

    loadTodaysSessions();

    const interval = setInterval(loadTodaysSessions, 30000);

    return () => clearInterval(interval);
  }, []);

  const getRandomColor = () => {
    const gradients = [
      'linear-gradient(135deg, #FFA07A 0%, #FF8C69 50%, #FF7F50 100%)',
      'linear-gradient(135deg, #87CEEB 0%, #87CEFA 50%, #B0E0E6 100%)',
      'linear-gradient(135deg, #FF9999 0%, #FFB6C1 50%, #FFC0CB 100%)',
      'linear-gradient(135deg, #90EE90 0%, #98FB98 50%, #F0FFF0 100%)',
      'linear-gradient(135deg, #DDA0DD 0%, #E6E6FA 50%, #F8F8FF 100%)',
      'linear-gradient(135deg, #F0E68C 0%, #FFFFE0 50%, #FFFACD 100%)',
      'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 50%, #FFE4E1 100%)',
      'linear-gradient(135deg, #98FB98 0%, #AFEEEE 50%, #E0FFFF 100%)'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
          darkMode={darkMode}
          toggleDark={() => setDarkMode(prev => !prev)}
        />
        <main className="dashboard-main">
          <div className="session-log-container">
            <div className="empty-sessions">
              <h2>Loading sessions...</h2>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
        <div className="session-log-container">
          {todaysSessions.length === 0 ? (
            <div className="empty-sessions">
              <h2>No Sessions Completed Today</h2>
              <p>Complete your first study session today to see it appear here!</p>
            </div>
          ) : (
            <div className="session-log-grid">
              {todaysSessions.map((session, index) => (
                <div key={session._id || index} className="figma-session-card">
                  <div 
                    className="figma-session-header" 
                    style={{ background: getRandomColor() }}
                  />
                  <div className="figma-session-body">
                    <div className="figma-session-subject">
                      {session.subject ? session.subject.toUpperCase() : 'GENERAL STUDY'}
                    </div>
                    <div className="figma-session-hours">{formatDuration(session.durationMinutes || 0)}</div>
                    <div className="figma-session-date">{formatDate(session.studyDate || new Date())}</div>
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