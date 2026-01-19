import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login } from './services/authService';
import loginImg from "./Images/login.png";
import group7 from "./Images/Group 7.png";
import Logo  from './Images/logo.png';

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

  const googleLogin = () => {
  window.location.href = 'http://localhost:5000/api/auth/google';
};


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
      navigate('/', { 
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
        <img src={Logo} className="logo-image " alt="समय SYNC" />
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
             <button type="button" onClick={googleLogin}  className="google-button" disabled={loading}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          <center className='auth-footer' >OR</center>
          

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