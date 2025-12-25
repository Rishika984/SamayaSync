import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from './services/authService';
import signupImg from './Images/login.png';
import group7 from './Images/Group 7.png';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const googleLogin = () => {
  window.location.href = 'http://localhost:5000/api/auth/google';
};


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError(''); // Clear error when typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🟢 Sending signup request:', formData);

    try {
      // Client-side validation
      if (!formData.fullName || !formData.email || !formData.password) {
        throw new Error('Please fill in all required fields.');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      // Send data to backend
      const response = await register(formData);
      console.log('✅ Registration success:', response);

      navigate('/login', {
        state: { message: 'Registration successful! Please login to continue.' }
      });

    } catch (err) {
      console.error('❌ Registration failed:', err);

      // Show exact backend error message
      let errorMsg = 'Registration failed. Please try again.';

      if (err.response) {
        // Server responded with an error
        console.error('🔴 Server Response:', err.response);
        errorMsg = err.response.data?.message || JSON.stringify(err.response.data);
      } else if (err.request) {
        // No response from server
        console.error('🟡 No Response from Server:', err.request);
        errorMsg = 'No response from server. Check your backend connection.';
      } else if (err.message) {
        // Other error
        errorMsg = err.message;
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
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
          <p className="auth-subtitle">Create an account and unlock your full potential.</p>
          <div className="auth-icon">
            <img src={signupImg} alt="Signup" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </div>
        <img src={group7} alt="Decor" className="auth-decor" />
      </div>

      <div className="auth-right">
        <form className="auth-form" onSubmit={handleSubmit}>
          
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
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={2}
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
              disabled={loading}
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
              minLength={6}
              placeholder="At least 6 characters"
            />
          </div>

          <button 
            type="submit"
            className="auth-button"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button type="button" onClick={googleLogin}  className="google-button" disabled={loading}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>



          <p className="auth-footer">
            Already have an account? <Link to="/login" className="auth-link">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;