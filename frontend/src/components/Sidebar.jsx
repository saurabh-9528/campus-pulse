import React from 'react';
import { LayoutDashboard, FileText, PlusCircle, Calendar, Sparkles, X } from 'lucide-react';

export function Sidebar({ currentScreen, onNavigate, mobileOpen, onCloseMobile }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notices', label: 'All Notices', icon: FileText },
    { id: 'add-notice', label: 'Add Notice', icon: PlusCircle },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'summary', label: 'Weekly Summary', icon: Sparkles },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#FAF8F2"/>
              <path d="M6 16.5H11L13.5 10.5L18.5 22.5L21 16.5H26" stroke="#245C45" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="brand-text">
            <span className="brand-title">Campus Pulse</span>
            <span className="brand-tagline">Notice Hub</span>
          </div>

          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onCloseMobile}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Main Navigation">
          <ul className="nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <li key={item.id} className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                    onClick={() => {
                      onNavigate(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={18} className="nav-icon" aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="system-pill">
            <span className="system-dot" aria-hidden="true" />
            <span>Campus Pulse v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

