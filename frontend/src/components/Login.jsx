import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login } from './services/authService';
import loginImg from "./Images/login.png";
import group7 from "./Images/Group 7.png";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Call backend API for login
      const response = await login(formData);
      
      console.log('Login successful:', response);
      
      // Navigate directly to active session with onboard prompt
      navigate('/active-session', { 
        state: { 
          showOnboard: true,
          user: response // Pass user data via state
        } 
      });
    } catch (err) {
      // Handle different error types
      const errorMessage = err.response?.data?.message || err.message;
      
      if (errorMessage === 'Invalid email or password') {
        setError('Invalid email or password. Please try again.');
      } else if (errorMessage === 'User already exists') {
        setError('This email is already registered. Please use login.');
      } else if (errorMessage === 'Network Error') {
        setError('Cannot connect to server. Please try again later.');
      } else {
        setError(errorMessage || 'Login failed. Please try again.');
      }
      
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
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
          {success && (
            <div style={{
              padding: '12px',
              marginBottom: '20px',
              backgroundColor: '#d1fae5',
              border: '1px solid #a7f3d0',
              borderRadius: '8px',
              color: '#065f46',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {success}
            </div>
          )}

          {error && (
            <div className="error-message" style={{
              padding: '12px',
              marginBottom: '20px',
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="email"
              placeholder="Enter your email"
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
              disabled={loading}
              autoComplete="current-password"
              placeholder="Enter your password"
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
            style={{ 
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>

          <p className="auth-footer">
            <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
          </p>

          <p className="auth-footer" style={{ marginTop: '10px' }}>
            Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;