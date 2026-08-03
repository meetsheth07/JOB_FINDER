import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, RefreshCw, LogOut, Bookmark, LogIn } from 'lucide-react';

export default function Header({ onRefresh, totalCount }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/auth');
  };

  return (
    <header className="app-header">
      <div className="brand-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <div className="logo-icon">
          <Briefcase size={24} />
        </div>
        <div>
          <h1 className="brand-title">JOB_SEARCH</h1>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Discover & Save Your Next Opportunity
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {location.pathname === '/' && (
          <button className="btn-secondary" onClick={onRefresh} title="Refresh jobs">
            <RefreshCw size={14} />
            Sync ({totalCount})
          </button>
        )}

        {isAuthenticated ? (
          <div className="user-menu-container" ref={dropdownRef}>
            <button
              className="user-avatar-btn"
              onClick={() => setShowDropdown(!showDropdown)}
              title={user?.name || 'Account'}
            >
              <div className="user-avatar">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="user-name-text">{user?.name?.split(' ')[0]}</span>
            </button>

            {showDropdown && (
              <div className="user-dropdown glass-panel">
                <div className="user-dropdown-header">
                  <div className="user-avatar" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="user-dropdown-name">{user?.name}</div>
                    <div className="user-dropdown-email">{user?.email}</div>
                  </div>
                </div>
                <div className="user-dropdown-divider" />
                <button
                  className="user-dropdown-item"
                  onClick={() => { navigate('/saved'); setShowDropdown(false); }}
                >
                  <Bookmark size={15} />
                  My Saved Jobs
                </button>
                <button
                  className="user-dropdown-item user-dropdown-item-danger"
                  onClick={handleLogout}
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="btn-primary"
            onClick={() => navigate('/auth')}
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            <LogIn size={15} />
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
