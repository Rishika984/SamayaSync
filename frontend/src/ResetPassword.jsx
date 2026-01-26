import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleReset = async () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setSuccess('Password reset successful. Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout" style={{ justifyContent: 'center', alignItems: 'center' }} >
      <main className="dashboard-main" style={{ justifyContent: 'center', flex:'none', marginLeft:'0', minWidth:'30rem' }}>
        <div className="progress-section" style={{ maxWidth: 420 }}>

          <h2 className="section-title">Reset Password</h2>
          <p style={{ color: '#64748b', marginBottom: 20 }}>
            Enter your new password
          </p>

          {success && (
            <div className="plan-success" style={{ marginBottom: 12 }}>
              {success}
            </div>
          )}

          {error && (
            <div className="error-message" style={{ marginBottom: 12 }}>
              {error}
            </div>
          )}

          <div className="plan-form-group">
            <label>New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="plan-form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            className="plan-btn plan-btn-add"
            style={{ width: '100%' }}
            onClick={handleReset}
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

        </div>
      </main>
    </div>
  );
}
 

export default ResetPassword;
