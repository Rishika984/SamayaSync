import React, { useState } from 'react';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setSuccess(data.message || 'Reset link sent successfully');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout" style={{ justifyContent: 'center', alignItems: 'center' }} >
      <main className="dashboard-main" style={{ justifyContent: 'center', flex:'none', marginLeft:'0' }}>
        <div className="progress-section" style={{ maxWidth: 420 }}>

          <h2 className="section-title">Forgot Password</h2>
          <p style={{ color: '#64748b', marginBottom: 20 }}>
            Enter your email to receive a password reset link
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
            <label>Email</label>
            <input
              type="email"
              placeholder="ritesh@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            className="plan-btn plan-btn-add"
            style={{ width: '100%' }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

        </div>
      </main>
    </div>
  );
}

export default ForgotPassword;
