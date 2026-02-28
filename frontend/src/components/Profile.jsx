import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getCurrentUser, updateUserProfile, uploadProfilePicture } from './services/authService';
import { getStudyStats } from './services/studyService';
import Sidebar from './Sidebar';

function Profile({ darkMode, setDarkMode }) {
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profileImage: '',
    joinDate: '',
    studyGoal: '2 hours daily',
    totalDays: 0
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    studyGoal: ''
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const [stats, setStats] = useState({
    totalHours: 0,
    sessionsCompleted: 0,
    streakDays: 0,
    averageDaily: 0
  });

  const [achievements] = useState([
    { id: 1, title: 'First Steps', description: 'Complete your first study session', icon: '🎯', unlocked: false },
    { id: 2, title: 'Consistency Champion', description: 'Study for 7 days in a row', icon: '🔥', unlocked: false },
    { id: 3, title: 'Marathon Master', description: 'Complete a 2-hour study session', icon: '⏰', unlocked: false },
    { id: 4, title: 'Century Club', description: 'Complete 100 total hours', icon: '💯', unlocked: false },
    // { id: 5, title: 'Early Bird', description: 'Start a session before 8 AM', icon: '🌅', unlocked: false },
    { id: 6, title: 'Night Owl', description: 'Study after 10 PM', icon: '🦉', unlocked: false }
  ]);

  // Fetch user data and stats from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch user profile
        const userData = await getCurrentUser();

        // Split fullName into firstName and lastName
        const nameParts = userData.fullName ? userData.fullName.split(' ') : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // FIXED: Backend returns createdAt from timestamps, not joinDate
        // The backend sends createdAt in the response
        console.log('User data received:', userData); // Debug log

        const joinDateRaw = new Date(userData.createdAt);

        // Format join date
        const formattedJoinDate = joinDateRaw.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric'
        });

        // FIXED: Calculate days since joining correctly
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset to start of today

        const joinDate = new Date(joinDateRaw);
        joinDate.setHours(0, 0, 0, 0); // Reset to start of join day

        // Calculate difference in milliseconds, then convert to days
        const diffTime = today - joinDate;
        const totalDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

        setProfileData({
          firstName,
          lastName,
          email: userData.email,
          profileImage: userData.profileImage || '',
          joinDate: formattedJoinDate,
          studyGoal: userData.studyGoal || '2 hours daily',
          totalDays
        });

        // Fetch study stats
        try {
          const statsData = await getStudyStats();
          setStats({
            totalHours: Math.round((statsData.totalMinutes / 60) * 10) / 10 || 0,
            sessionsCompleted: statsData.totalSessions || 0,
            streakDays: statsData.currentStreak || 0,
            averageDaily: statsData.averageSessionMinutes ? Math.round((statsData.averageSessionMinutes / 60) * 10) / 10 : 0
          });
        } catch (statsError) {
          console.log('Stats not available yet:', statsError);
          // Keep default stats (all zeros)
        }

        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load profile data. Please login again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openEditModal = () => {
    setEditFormData({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      studyGoal: profileData.studyGoal
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const fullName = `${editFormData.firstName} ${editFormData.lastName}`.trim();

      await updateUserProfile({
        fullName: fullName || undefined,
        studyGoal: editFormData.studyGoal
      });

      // Update local state to reflect changes immediately
      setProfileData({
        ...profileData,
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        studyGoal: editFormData.studyGoal
      });

      setShowEditModal(false);
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (e.g., max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await uploadProfilePicture(formData);

      // Update the profile data with the new image URL
      setProfileData(prev => ({
        ...prev,
        profileImage: response.profileImage
      }));

      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } catch (error) {
      console.error('Profile picture upload failed:', error);
      // Only alert if it's a real error and not a component unmount or similar
      if (!error.__CANCEL__) {
        alert(`Upload failed: ${error.response?.data?.message || error.message || 'Unknown error'}`);
      }
    } finally {
      setUploadingImage(false);
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
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
          darkMode={darkMode}
          toggleDark={() => setDarkMode(prev => !prev)}
        />
        <main className="dashboard-main">
          <div className="profile-container">
            <div className="loading-state">
              <div className="loading-spinner"></div>
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
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
          darkMode={darkMode}
          toggleDark={() => setDarkMode(prev => !prev)}
        />
        <main className="dashboard-main">
          <div className="profile-container">
            <div className="error-state">
              <div>❌ {error}</div>
              <button
                onClick={() => window.location.href = '/login'}
                className="error-login-btn"
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
                <div className="profile-avatar-wrapper" style={{ position: 'relative' }}>
                  <div className="profile-avatar-enhanced">
                    <img
                      src={profileData.profileImage ? `http://localhost:5000${profileData.profileImage}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.firstName || 'S')}+${encodeURIComponent(profileData.lastName || 'tudent')}&background=a78bfa&color=fff&size=120`}
                      alt="Profile"
                      className="avatar-image-enhanced"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>

                  <button
                    className="avatar-upload-btn"
                    onClick={triggerFileInput}
                    disabled={uploadingImage}
                    title="Change Profile Picture"
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      background: '#9170e6',
                      color: 'white',
                      border: '2px solid white',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                      transition: 'all 0.2s',
                      zIndex: 2,
                    }}
                  >
                    {uploadingImage ? '⏳' : '📷'}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
                <div className="profile-info-enhanced">
                  <h2 className="profile-name-enhanced">
                    {profileData.firstName || profileData.lastName ?
                      `${profileData.firstName} ${profileData.lastName}`.trim() :
                      'Student'
                    }
                  </h2>
                  <p className="profile-nickname">{profileData.email}</p>

                  <div className="profile-meta">
                    <span className="join-date">📅 Member since {profileData.joinDate}</span>
                    <span className="days-active">⏱️ {profileData.totalDays} days on platform</span>
                  </div>
                </div>
              </div>

              {/* Edit Profile Action */}
              <button className="edit-profile-btn" onClick={openEditModal}>
                ✏️ Edit Profile
              </button>
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

          </div>
        </div>
      </main>

      {/* Success Popup */}
      {
        showSuccessPopup && (
          <div className="success-popup-overlay">
            <div className="success-popup">
              <div className="success-icon">✅</div>
              <h3 className="success-title">Success!</h3>
              <p className="success-message">Profile updated successfully</p>
            </div>
          </div>
        )
      }

      {/* Edit Profile Modal */}
      {
        showEditModal && createPortal(
          <div className="profile-edit-modal-overlay" onClick={closeEditModal}>
            <div className="profile-edit-modal" onClick={e => e.stopPropagation()}>
              <div className="profile-edit-modal-header">
                <h3>Edit Profile Settings</h3>
                <button className="plan-modal-close" onClick={closeEditModal}>×</button>
              </div>

              <form onSubmit={handleSave} className="profile-edit-modal-body">
                <div className="plan-form-group">
                  <label htmlFor="editFirstName">First Name</label>
                  <input
                    type="text"
                    id="editFirstName"
                    name="firstName"
                    value={editFormData.firstName}
                    onChange={handleEditChange}
                    placeholder="First Name"
                    required
                  />
                </div>

                <div className="plan-form-group">
                  <label htmlFor="editLastName">Last Name</label>
                  <input
                    type="text"
                    id="editLastName"
                    name="lastName"
                    value={editFormData.lastName}
                    onChange={handleEditChange}
                    placeholder="Last Name"
                  />
                </div>

                <div className="plan-form-group">
                  <label htmlFor="editStudyGoal">Daily Study Goal</label>
                  <select
                    id="editStudyGoal"
                    name="studyGoal"
                    value={editFormData.studyGoal}
                    onChange={handleEditChange}
                  >
                    <option value="30 minutes daily">30 minutes daily</option>
                    <option value="1 hour daily">1 hour daily</option>
                    <option value="2 hours daily">2 hours daily</option>
                    <option value="3 hours daily">3 hours daily</option>
                    <option value="4+ hours daily">4+ hours daily</option>
                  </select>
                </div>

                <div className="plan-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="disabled-input"
                    title="Email cannot be changed"
                    style={{ backgroundColor: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }}
                  />
                </div>

                <div className="profile-edit-modal-footer">
                  <button type="button" className="plan-btn plan-btn-cancel" onClick={closeEditModal}>
                    Cancel
                  </button>
                  <button type="submit" className="plan-btn plan-btn-add" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )
      }
    </div >
  );
}

export default Profile;
