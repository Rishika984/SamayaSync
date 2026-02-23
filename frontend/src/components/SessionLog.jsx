import React, { useState, useEffect } from 'react';
import { getStudySessions } from './services/studyService';
import Sidebar from './Sidebar';

function SessionLog({ darkMode, setDarkMode }) {
  const [sessions, setSessions] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('today');

  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        const allSessions = await getStudySessions(100);
        setSessions(allSessions || []);
      } catch (error) {
        console.error('Error loading sessions:', error);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();

    const interval = setInterval(loadSessions, 30000);

    return () => clearInterval(interval);
  }, []);

  const getRandomColor = () => {
    const lightGradients = [
      'linear-gradient(135deg, #FFA07A 0%, #FF8C69 50%, #FF7F50 100%)',
      'linear-gradient(135deg, #87CEEB 0%, #87CEFA 50%, #B0E0E6 100%)',
      'linear-gradient(135deg, #FF9999 0%, #FFB6C1 50%, #FFC0CB 100%)',
      'linear-gradient(135deg, #90EE90 0%, #98FB98 50%, #F0FFF0 100%)',
      'linear-gradient(135deg, #DDA0DD 0%, #E6E6FA 50%, #F8F8FF 100%)',
      'linear-gradient(135deg, #F0E68C 0%, #FFFFE0 50%, #FFFACD 100%)',
      'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 50%, #FFE4E1 100%)',
      'linear-gradient(135deg, #98FB98 0%, #AFEEEE 50%, #E0FFFF 100%)'
    ];

    const darkGradients = [
      'linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%)',
      'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
      'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
      'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
      'linear-gradient(135deg, #701a75 0%, #86198f 100%)',
      'linear-gradient(135deg, #451a03 0%, #78350f 100%)',
      'linear-gradient(135deg, #312e81 0%, #3730a3 100%)',
      'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
    ];

    const selectedGradients = darkMode ? darkGradients : lightGradients;
    return selectedGradients[Math.floor(Math.random() * selectedGradients.length)];
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

  const isToday = (date) => {
    const today = new Date();
    const checkDate = new Date(date);
    return checkDate.toDateString() === today.toDateString();
  };

  const isYesterday = (date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const checkDate = new Date(date);
    return checkDate.toDateString() === yesterday.toDateString();
  };

  const filterSessionsByDate = (sessions) => {
    if (selectedDate === 'all') return sessions;

    return sessions.filter(session => {
      if (selectedDate === 'today') {
        return isToday(session.studyDate);
      } else if (selectedDate === 'yesterday') {
        return isYesterday(session.studyDate);
      } else if (selectedDate === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(session.studyDate) >= weekAgo;
      } else if (selectedDate === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return new Date(session.studyDate) >= monthAgo;
      }
      return true;
    });
  };

  const groupSessionsByDate = (sessions) => {
    const grouped = {};

    sessions.forEach(session => {
      const date = new Date(session.studyDate);
      let label;

      if (isToday(date)) {
        label = 'Today';
      } else if (isYesterday(date)) {
        label = 'Yesterday';
      } else {
        label = date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      if (!grouped[label]) {
        grouped[label] = [];
      }
      grouped[label].push(session);
    });

    return grouped;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const filteredSessions = filterSessionsByDate(sessions);
  const groupedSessions = groupSessionsByDate(filteredSessions);

  // Get the last day with sessions (excluding today)
  const getLastDayWithSessions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pastSessions = sessions.filter(session => {
      const sessionDate = new Date(session.studyDate);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate < today;
    });

    if (pastSessions.length === 0) return null;

    // Sort by date descending and get the most recent
    const sortedSessions = pastSessions.sort((a, b) =>
      new Date(b.studyDate) - new Date(a.studyDate)
    );

    const lastDate = new Date(sortedSessions[0].studyDate);
    lastDate.setHours(0, 0, 0, 0);

    // Get all sessions from that day
    const lastDaySessions = sortedSessions.filter(session => {
      const sessionDate = new Date(session.studyDate);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === lastDate.getTime();
    });

    return {
      date: lastDate,
      sessions: lastDaySessions
    };
  };

  const lastDayData = getLastDayWithSessions();

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
          <div className="session-log-header">
            <h2 className="section-title">Study Sessions</h2>
            <div className="session-filters">
              <button
                className={`filter-btn ${selectedDate === 'today' ? 'active' : ''}`}
                onClick={() => setSelectedDate('today')}
              >
                Today
              </button>
              <button
                className={`filter-btn ${selectedDate === 'yesterday' ? 'active' : ''}`}
                onClick={() => setSelectedDate('yesterday')}
              >
                Yesterday
              </button>
              <button
                className={`filter-btn ${selectedDate === 'week' ? 'active' : ''}`}
                onClick={() => setSelectedDate('week')}
              >
                Last 7 Days
              </button>
              <button
                className={`filter-btn ${selectedDate === 'month' ? 'active' : ''}`}
                onClick={() => setSelectedDate('month')}
              >
                Last Month
              </button>
              <button
                className={`filter-btn ${selectedDate === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedDate('all')}
              >
                All Time
              </button>
            </div>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="empty-sessions">
              <h2>No Sessions Found</h2>
              <p>
                {selectedDate === 'today' && 'Complete your first study session today to see it appear here!'}
                {selectedDate === 'yesterday' && 'No sessions were completed yesterday.'}
                {selectedDate === 'week' && 'No sessions in the last 7 days.'}
                {selectedDate === 'month' && 'No sessions in the last month.'}
                {selectedDate === 'all' && 'Start studying to build your session history!'}
              </p>
            </div>
          ) : (
            <div className="session-history">
              {Object.entries(groupedSessions).map(([date, dateSessions]) => (
                <div key={date} className="session-date-group">
                  <h3 className="session-date-header">{date}</h3>
                  <div className="session-log-grid">
                    {dateSessions.map((session, index) => (
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
                </div>
              ))}
            </div>
          )}

          {/* Last Day with Sessions - Only show when viewing "Today" and there are past sessions */}
          {selectedDate === 'today' && lastDayData && (
            <div className="last-day-section">
              <div className="last-day-header">
                <h3 className="last-day-title">
                  {isYesterday(lastDayData.date)
                    ? 'Yesterday'
                    : `Last Study Day - ${formatDate(lastDayData.date)}`
                  }
                </h3>
              </div>
              <div className="session-log-grid">
                {lastDayData.sessions.map((session, index) => (
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
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default SessionLog;