import React from 'react';
import { Menu, Plus, Bell } from 'lucide-react';

export function Topbar({ pageTitle, onToggleMobile, onQuickAdd }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onToggleMobile}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>
        <h1 className="topbar-title">{pageTitle}</h1>
      </div>

      <div className="topbar-right">
        <div className="topbar-badge" title="Campus alerts active">
          <Bell size={18} aria-hidden="true" />
          <span className="topbar-badge-indicator" />
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm topbar-action-btn"
          onClick={onQuickAdd}
        >
          <Plus size={16} aria-hidden="true" />
          <span>Add Notice</span>
        </button>
      </div>
    </header>
  );
}

export default Topbar;

