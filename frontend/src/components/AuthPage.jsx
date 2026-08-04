import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/');
      } else {
        await register(name, email, password);
        // Registration successful — redirect to sign-in tab with a banner
        setName('');
        setEmail('');
        setPassword('');
        setIsLogin(true);
        setSuccessMsg('Account created! Please sign in to continue.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMsg('');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="auth-page">
      <div className="auth-ambient auth-ambient-1" />
      <div className="auth-ambient auth-ambient-2" />

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="console-nav-mark" style={{ width: 32, height: 32, borderRadius: 8 }} />
          </div>
          <h1 className="auth-title">
            {isLogin ? 'Welcome Back' : 'Join JOB_FINDER'}
          </h1>
          <p className="auth-subtitle">
            {isLogin
              ? 'SIGN IN TO ACCESS YOUR SAVED JOBS AND SEARCH CONSOLE'
              : 'CREATE AN ACCOUNT TO SAVE JOBS AND TRACK APPLICATIONS'}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            SIGN IN
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            REGISTER
          </button>
        </div>

        {error && (
          <div className="auth-error">
            <span>⚠</span> {error}
          </div>
        )}

        {successMsg && (
          <div className="auth-error" style={{ background: 'var(--status-green-dim)', color: 'var(--status-green)', borderColor: 'var(--status-green-border)' }}>
            <span>✓</span> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="auth-input-group">
              <label className="auth-input-label">
                <User size={13} />
                FULL NAME
              </label>
              <input
                type="text"
                className="custom-input auth-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                autoComplete="name"
              />
            </div>
          )}

          <div className="auth-input-group">
            <label className="auth-input-label">
              <Mail size={13} />
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              className="custom-input auth-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-input-group">
            <label className="auth-input-label">
              <Lock size={13} />
              PASSWORD
            </label>
            <input
              type="password"
              className="custom-input auth-input"
              placeholder={isLogin ? '••••••••' : 'Min. 6 characters'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner" />
                {isLogin ? 'SIGNING IN...' : 'CREATING ACCOUNT...'}
              </>
            ) : (
              <>
                {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "DON'T HAVE AN ACCOUNT?" : 'ALREADY HAVE AN ACCOUNT?'}
            <button className="auth-link" onClick={toggleMode}>
              {isLogin ? 'CREATE ONE' : 'SIGN IN'}
            </button>
          </p>
        </div>

        <div className="auth-feature-hint">
          <Sparkles size={12} />
          <span>SAVED JOBS AVAILABLE FOR 3 DAYS</span>
        </div>
      </div>
    </div>
  );
}
