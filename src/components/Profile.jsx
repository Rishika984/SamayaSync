import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';

function Profile() {
  const [profileData, setProfileData] = useState({
    firstName: 'Rishika',
    lastName: 'Adhikari',
    nickName: 'Rishi',
    email: 'rishikaadhikari@gmail.com',
    joinDate: '',
    studyGoal: '2 hours daily'
  });

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalHours: 0,
    sessionsCompleted: 0,
    streakDays: 0,
    averageDaily: 0,
    longestSession: 0,
    totalDays: 0
  });

  const [achievements] = useState([
    { id: 1, title: 'First Steps', description: 'Complete your first study session', icon: '🎯', unlocked: false },
    { id: 2, title: 'Consistency Champion', description: 'Study for 7 days in a row', icon: '🔥', unlocked: false },
    { id: 3, title: 'Marathon Master', description: 'Complete a 2-hour study session', icon: '⏰', unlocked: false },
    { id: 4, title: 'Century Club', description: 'Complete 100 total hours', icon: '💯', unlocked: false },
    { id: 5, title: 'Early Bird', description: 'Start a session before 8 AM', icon: '🌅', unlocked: false },
    { id: 6, title: 'Night Owl', description: 'Study after 10 PM', icon: '🦉', unlocked: false }
  ]);

  const calculateUserStats = useCallback(() => {
    const completedSessions = JSON.parse(localStorage.getItem('completedSessions') || '[]');
    
    if (completedSessions.length === 0) {
      return;
    }

    // Calculate total hours
    const totalMinutes = completedSessions.reduce((total, session) => total + session.duration, 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    // Calculate sessions completed
    const sessionsCompleted = completedSessions.length;

    // Calculate streak days (reuse logic from Dashboard)
    const streakDays = calculateStreakDays(completedSessions);

    // Calculate average daily hours
    const uniqueDays = [...new Set(completedSessions.map(session => 
      new Date(session.completedAt).toDateString()
    ))];
    const averageDaily = uniqueDays.length > 0 ? Math.round((totalHours / uniqueDays.length) * 10) / 10 : 0;

    // Find longest session
    const longestSession = Math.max(...completedSessions.map(session => session.duration));

    // Days since joining
    const joinDate = new Date(profileData.joinDate);
    const today = new Date();
    const totalDays = Math.ceil((today - joinDate) / (1000 * 60 * 60 * 24));

    setStats({
      totalHours,
      sessionsCompleted,
      streakDays,
      averageDaily,
      longestSession: Math.round(longestSession),
      totalDays
    });
  }, [profileData.joinDate]);

  useEffect(() => {
    calculateUserStats();
  }, [calculateUserStats]);

  useEffect(() => {
    // Initialize join date if not already set
    const storedProfile = localStorage.getItem('userProfile');
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile);
      if (parsedProfile.joinDate) {
        setProfileData(prev => ({ ...prev, joinDate: parsedProfile.joinDate }));
      } else {
        // Set join date to current date if not already set
        setProfileData(prev => {
          const updatedProfile = { ...prev, joinDate: currentDate };
          localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
          return updatedProfile;
        });
      }
    } else {
      // First time user - set join date to current date
      setProfileData(prev => {
        const updatedProfile = { ...prev, joinDate: currentDate };
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        return updatedProfile;
      });
    }
  }, []);

  const calculateStreakDays = (sessions) => {
    if (sessions.length === 0) return 0;

    // Get unique study days with at least 60 minutes
    const studyDays = {};
    sessions.forEach(session => {
      const dayKey = new Date(session.completedAt).toDateString();
      if (!studyDays[dayKey]) studyDays[dayKey] = 0;
      studyDays[dayKey] += session.duration;
    });

    const validDays = Object.keys(studyDays)
      .filter(day => studyDays[day] >= 60)
      .sort((a, b) => new Date(b) - new Date(a));

    if (validDays.length === 0) return 0;

    let streak = 1;
    for (let i = 1; i < validDays.length; i++) {
      const currentDate = new Date(validDays[i-1]);
      const previousDate = new Date(validDays[i]);
      const daysDiff = Math.ceil((currentDate - previousDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Save to localStorage for persistence
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    alert('Profile updated successfully!');
  };

  const handleEditEmail = () => {
    setNewEmail(profileData.email);
    setIsEditingEmail(true);
  };

  const handleSaveEmail = () => {
    if (newEmail.trim() && newEmail.includes('@')) {
      setProfileData({
        ...profileData,
        email: newEmail
      });
      setIsEditingEmail(false);
      alert('Email address updated successfully!');
    } else {
      alert('Please enter a valid email address.');
    }
  };

  const handleCancelEmailEdit = () => {
    setNewEmail('');
    setIsEditingEmail(false);
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
        <div className="profile-container">


          {/* Main Profile Card */}
          <div className="enhanced-profile-card">
            <div className="profile-hero">
              <div className="profile-avatar-section">
                <div className="profile-avatar-enhanced">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${profileData.firstName}+${profileData.lastName}&background=a78bfa&color=fff&size=120`}
                    alt="Profile" 
                    className="avatar-image-enhanced"
                  />
                </div>
                <div className="profile-info-enhanced">
                  <h2 className="profile-name-enhanced">{profileData.firstName} {profileData.lastName}</h2>
                  <p className="profile-nickname">"{profileData.nickName}"</p>
                  <div className="profile-meta">
                    <span className="join-date">📅 Member since {profileData.joinDate}</span>
                    <span className="days-active">⏱️ {stats.totalDays} days on platform</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Statistics Grid */}
            <div className="profile-stats-enhanced">
              <h3 className="stats-title">📊 Your Study Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card-enhanced primary">
                  <div className="stat-icon-enhanced">📚</div>
                  <div className="stat-value-enhanced">{stats.totalHours}h</div>
                  <div className="stat-label-enhanced">Total Study Hours</div>
                </div>
                <div className="stat-card-enhanced secondary">
                  <div className="stat-icon-enhanced">✅</div>
                  <div className="stat-value-enhanced">{stats.sessionsCompleted}</div>
                  <div className="stat-label-enhanced">Sessions Completed</div>
                </div>
                <div className="stat-card-enhanced accent">
                  <div className="stat-icon-enhanced">🔥</div>
                  <div className="stat-value-enhanced">{stats.streakDays}</div>
                  <div className="stat-label-enhanced">Current Streak</div>
                </div>
                <div className="stat-card-enhanced info">
                  <div className="stat-icon-enhanced">📈</div>
                  <div className="stat-value-enhanced">{stats.averageDaily}h</div>
                  <div className="stat-label-enhanced">Daily Average</div>
                </div>
              </div>
            </div>

            {/* Achievements Section */}
            <div className="achievements-section">
              <h3 className="achievements-title">🏆 Achievements</h3>
              <div className="achievements-grid">
                {achievements.map(achievement => (
                  <div 
                    key={achievement.id} 
                    className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                  >
                    <div className="achievement-icon">{achievement.icon}</div>
                    <div className="achievement-info">
                      <h4 className="achievement-name">{achievement.title}</h4>
                      <p className="achievement-desc">{achievement.description}</p>
                    </div>
                    {achievement.unlocked && <div className="achievement-checkmark">✓</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Form */}
            <form className="enhanced-profile-form" onSubmit={handleSave}>
              <h3 className="form-title">⚙️ Profile Settings</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleChange}
                    placeholder="Your First Name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleChange}
                    placeholder="Your Last Name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nickName">Nickname</label>
                  <input
                    type="text"
                    id="nickName"
                    name="nickName"
                    value={profileData.nickName}
                    onChange={handleChange}
                    placeholder="Your Nickname"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="studyGoal">Daily Study Goal</label>
                <select
                  id="studyGoal"
                  name="studyGoal"
                  value={profileData.studyGoal}
                  onChange={handleChange}
                >
                  <option value="30 minutes daily">30 minutes daily</option>
                  <option value="1 hour daily">1 hour daily</option>
                  <option value="2 hours daily">2 hours daily</option>
                  <option value="3 hours daily">3 hours daily</option>
                  <option value="4+ hours daily">4+ hours daily</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="email-field-container">
                  {isEditingEmail ? (
                    <div className="email-edit-section">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Enter new email address"
                        className="email-edit-input"
                      />
                      <div className="email-edit-buttons">
                        <button 
                          type="button" 
                          onClick={handleSaveEmail}
                          className="email-save-btn"
                        >
                          Save
                        </button>
                        <button 
                          type="button" 
                          onClick={handleCancelEmailEdit}
                          className="email-cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="email-display-section">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profileData.email}
                        disabled
                        className="email-display-input"
                      />
                      <button 
                        type="button" 
                        onClick={handleEditEmail}
                        className="change-email-btn"
                      >
                        Change Email
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="enhanced-save-btn">
                💾 Save Profile Changes
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;