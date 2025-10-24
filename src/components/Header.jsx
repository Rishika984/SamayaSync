import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
          <span className="logo-hindi">समय</span>
          <span className="logo-english">SYNC</span>
        </Link>
        <nav className="nav">
          <Link to="/signup" className="nav-link">Signup</Link>
          <Link to="/login">
            <button className="login-button">Login</button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;