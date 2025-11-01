import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import loginImg from "./Images/login.png";
import group7 from "./Images/Group 7.png";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login data:', formData);
    
    // Save login session data
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loginEmail', formData.email);
    
    // navigate directly to active session; active session will show the start prompt
    navigate('/active-session', { state: { showOnboard: true } });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <Link to="/" className="auth-logo">
          <span className="logo-hindi">समय</span>
          <span className="logo-english">SYNC</span>
        </Link>
        
        <div className="auth-content">
          <h1 className="auth-title">Login</h1>
          <p className="auth-subtitle">Login to continue your study journey.</p>
          
          <div className="auth-icon">
            <img src={loginImg} alt="Login" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </div>

        {/* Decorative image placed at bottom-left of the purple panel */}
        <img src={group7} alt="Group 7 decoration" className="auth-decor" />
      </div>

      <div className="auth-right">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-button">Log In</button>

          <p className="auth-footer">
            <Link to="#" className="auth-link">Forgot Password?</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;