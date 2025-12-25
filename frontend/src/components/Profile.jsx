import React, { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, updateUserProfile } from './services/authService';
import Sidebar from './Sidebar';

function Profile({ darkMode, setDarkMode }) {
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    nickName: '',
    email: '',
    joinDate: '',
    studyGoal: '2 hours daily'
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [stats] = useState({
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

  // Fetch user data from backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await getCurrentUser();
        
        // Split fullName into firstName and lastName
        const nameParts = userData.fullName ? userData.fullName.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Format join date
        const formattedJoinDate = new Date(userData.joinDate).toLocaleDateString('en-US', {
          weekday: 'short',
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });

        // Calculate days since joining
        const joinDate = new Date(userData.joinDate);
        const today = new Date();
        const totalDays = Math.max(0, Math.ceil((today - joinDate) / (1000 * 60 * 60 * 24)));

        const updatedProfileData = {
          firstName,
          lastName,
          nickName: userData.nickName || firstName || 'Learner',
          email: userData.email,
          joinDate: formattedJoinDate,
          studyGoal: userData.studyGoal || '2 hours daily',
          totalDays
        };

        setProfileData(updatedProfileData);
        setError('');
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data. Please login again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Save only editable fields to backend
      await updateUserProfile({
        nickName: profileData.nickName,
        studyGoal: profileData.studyGoal
      });
      
      // Show success popup
      setShowSuccessPopup(true);
      
      // Auto-hide popup after 3 seconds
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
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
        <Sidebar />
        <main className="dashboard-main">
          <div className="profile-container">
            <div className="loading-state" style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '60vh',
              fontSize: '18px',
              color: '#6366f1',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div className="loading-spinner" style={{
                border: '4px solid #f3f4f6',
                borderTop: '4px solid #6366f1',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite'
              }}></div>
              <div>Loading profile...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="profile-container">
            <div className="error-state" style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '60vh',
              fontSize: '18px',
              color: '#dc2626',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div>❌ {error}</div>
              <button 
                onClick={() => window.location.href = '/login'} 
                style={{
                  padding: '10px 20px',
                  background: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Go to Login
              </button>
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
        <div className="profile-container">
          {/* Main Profile Card */}
          <div className="enhanced-profile-card">
            <div className="profile-hero">
              <div className="profile-avatar-section">
                <div className="profile-avatar-enhanced">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.firstName || 'S')}+${encodeURIComponent(profileData.lastName || 'tudent')}&background=a78bfa&color=fff&size=120`}
                    alt="Profile" 
                    className="avatar-image-enhanced"
                  />
                </div>
                <div className="profile-info-enhanced">
                  <h2 className="profile-name-enhanced">
                    {profileData.firstName || profileData.lastName ? 
                      `${profileData.firstName} ${profileData.lastName}`.trim() : 
                      'Student'
                    }
                  </h2>
                  <p className="profile-nickname">{profileData.email || 'Learner'}</p>
                  <div className="profile-meta">
                    <span className="join-date">📅 Member since {profileData.joinDate}</span>
                    <span className="days-active">⏱️ {profileData.totalDays || 0} days on platform</span>
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
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed', background: '#f3f4f6' }}
                    title="Name is set during registration and cannot be changed"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={profileData.lastName}
                    disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed', background: '#f3f4f6' }}
                    title="Name is set during registration and cannot be changed"
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
                    maxLength={30}
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
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed', background: '#f3f4f6' }}
                  title="Email is set during registration and cannot be changed"
                />
              </div>

              <button 
                type="submit" 
                className="enhanced-save-btn"
                disabled={saving}
                style={{ opacity: saving ? 0.7 : 1 }}
              >
                {saving ? '💾 Saving...' : '💾 Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="success-popup-overlay">
          <div className="success-popup">
            <div className="success-icon">✅</div>
            <h3 className="success-title">Success!</h3>
            <p className="success-message">Profile updated successfully</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;