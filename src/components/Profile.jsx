import React, { useState } from 'react';
import Sidebar from './Sidebar';

function Profile() {
  const [profileData, setProfileData] = useState({
    firstName: 'Rishika',
    nickName: 'Rishi',
    email: 'rishikaadhikari@gmail.com',
    joinDate: 'Tue, 07 June 2022'
  });

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
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

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="profile-header">
          <h1 className="profile-welcome">Welcome, {profileData.firstName}</h1>
          <p className="profile-date">{profileData.joinDate}</p>
        </div>

        <div className="profile-card">
          <div className="profile-info">
            <div className="profile-avatar">
              <img 
                src="https://ui-avatars.com/api/?name=Rishika+Adhikari&background=a78bfa&color=fff&size=120" 
                alt="Profile" 
                className="avatar-image"
              />
            </div>
            <div className="profile-details">
              <h2 className="profile-name">Rishika Adhikari</h2>
              <p className="profile-email">{profileData.email}</p>
            </div>
          </div>

          <form className="profile-form" onSubmit={handleSave}>
            <div className="profile-form-row">
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
                <label htmlFor="nickName">Nick Name</label>
                <input
                  type="text"
                  id="nickName"
                  name="nickName"
                  value={profileData.nickName}
                  onChange={handleChange}
                  placeholder="Your Nick Name"
                />
              </div>
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

            <div className="profile-stats">
              <div className="stat-box">
                <div className="stat-number">12</div>
                <div className="stat-text">Total Hours</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">7</div>
                <div className="stat-text">Sessions</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">4</div>
                <div className="stat-text">Streak Days</div>
              </div>
            </div>

            <button type="submit" className="profile-save-btn">Save Changes</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Profile;