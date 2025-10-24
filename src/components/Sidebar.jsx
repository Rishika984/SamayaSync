import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      <Link to="/" className="sidebar-logo">
        <span className="logo-hindi">समय</span>
        <span className="logo-english">SYNC</span>
      </Link>

      <nav className="sidebar-nav">
        <Link 
          to="/dashboard" 
          className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
        >
          Dashboard
        </Link>
        <Link 
          to="/active-session" 
          className={`sidebar-link ${isActive('/active-session') ? 'active' : ''}`}
        >
          Active Session
        </Link>
        <Link 
          to="/session-log" 
          className={`sidebar-link ${isActive('/session-log') ? 'active' : ''}`}
        >
          Session Log
        </Link>
      </nav>

      <div className="sidebar-bottom">
        <Link 
          to="/profile" 
          className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`}
        >
          Profile
        </Link>
        <Link to="/" className="sidebar-link">
          Log out
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;