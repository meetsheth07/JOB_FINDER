import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Briefcase, Sparkles } from 'lucide-react';

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

      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon" style={{ width: 48, height: 48 }}>
              <Briefcase size={26} />
            </div>
          </div>
          <h1 className="auth-title">
            {isLogin ? 'Welcome Back' : 'Join JOB_SEARCH'}
          </h1>
          <p className="auth-subtitle">
            {isLogin
              ? 'Sign in to access your saved jobs and personalized features'
              : 'Create an account to save jobs and track your applications'}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="auth-error">
            <span>⚠</span> {error}
          </div>
        )}

        {successMsg && (
          <div className="auth-error" style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', borderColor: 'rgba(52,211,153,0.3)' }}>
            <span>✓</span> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="auth-input-group">
              <label className="auth-input-label">
                <User size={15} />
                Full Name
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
              <Mail size={15} />
              Email Address
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
              <Lock size={15} />
              Password
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
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button className="auth-link" onClick={toggleMode}>
              {isLogin ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>

        <div className="auth-feature-hint">
          <Sparkles size={14} />
          <span>Save jobs and they'll be available for 3 days</span>
        </div>
      </div>
    </div>
  );
}
