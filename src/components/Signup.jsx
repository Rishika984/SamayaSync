import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import signupImg from './Images/login.png';
import group7 from './Images/Group 7.png';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Signup data:', formData);
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
          <h1 className="auth-title">Signup</h1>
          <p className="auth-subtitle">Create account and unlock your full potential.</p>

          <div className="auth-icon">
            <img src={signupImg} alt="Signup" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </div>

        <img src={group7} alt="Group 7 decoration" className="auth-decor" />
      </div>

      <div className="auth-right">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

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

          <button type="submit" className="auth-button">Sign Up</button>

          <p className="auth-footer">
            Already have an account? <Link to="/login" className="auth-link">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;