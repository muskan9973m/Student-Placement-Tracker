import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const requestToken = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
      if (data.reset_token) {
        setResetToken(data.reset_token);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/auth/reset-password', {
        email,
        reset_token: resetToken,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      setMessage(data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Forgot Password</h1>
        {error ? <div className="alert error">{error}</div> : null}
        {message ? <div className="alert success">{message}</div> : null}

        {step === 1 && (
          <form onSubmit={requestToken}>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <button className="btn btn-primary" type="submit">
              Get reset token
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={resetPassword}>
            <label>
              Reset token
              <input value={resetToken} onChange={(e) => setResetToken(e.target.value)} required />
            </label>
            <label>
              New password
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </label>
            <label>
              Confirm password
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </label>
            <button className="btn btn-primary" type="submit">
              Reset password
            </button>
          </form>
        )}

        {step === 3 && (
          <Link className="btn btn-primary" to="/login">
            Go to login
          </Link>
        )}

        <div className="auth-links">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
