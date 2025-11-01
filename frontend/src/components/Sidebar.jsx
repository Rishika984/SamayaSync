import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LogoutModal from './LogoutModal';

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    // Clear any stored user data
    localStorage.removeItem('userData');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('completedSessions');
    localStorage.removeItem('dailyPlans');
    // Navigate to home page
    navigate('/');
    setShowLogoutModal(false);
    if (onClose) {
      onClose();
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <Link to="/" className="sidebar-logo">
        <span className="logo-hindi">समय</span>
        <span className="logo-english">SYNC</span>
      </Link>

      <nav className="sidebar-nav">
        <Link 
          to="/dashboard" 
          className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
          onClick={handleLinkClick}
        >
          Dashboard
        </Link>
        <Link 
          to="/active-session" 
          className={`sidebar-link ${isActive('/active-session') ? 'active' : ''}`}
          onClick={handleLinkClick}
        >
          Active Session
        </Link>
        <Link 
          to="/session-log" 
          className={`sidebar-link ${isActive('/session-log') ? 'active' : ''}`}
          onClick={handleLinkClick}
        >
          Session Log
        </Link>
      </nav>

      <div className="sidebar-bottom">
        <Link 
          to="/profile" 
          className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`}
          onClick={handleLinkClick}
        >
          Profile
        </Link>
        <button 
          className="sidebar-link logout-btn" 
          onClick={handleLogoutClick}
        >
          Log out
        </button>
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </div>
  );
}

export default Sidebar;