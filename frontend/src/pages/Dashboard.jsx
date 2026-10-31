import React from 'react';
import { AlertCircle, Clock, CalendarDays, ArrowRight, Plus } from 'lucide-react';
import NoticeCard from '../components/NoticeCard.jsx';

export function Dashboard({ notices = [], onNavigate, isLoading = false }) {
  // Categorize notices for dashboard highlights
  const urgentNotices = notices.filter(
    (n) => n.priority?.toLowerCase() === 'urgent' || n.status?.toLowerCase() === 'urgent'
  );

  const upcomingDeadlines = notices.filter(
    (n) =>
      (n.category?.toLowerCase() === 'assignment' || n.category?.toLowerCase() === 'examination') &&
      n.status?.toLowerCase() !== 'expired'
  );

  const activeNotices = notices.filter((n) => n.status?.toLowerCase() !== 'expired');
  const todaysNotices = activeNotices.slice(0, 3);

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-state-box">
          <span className="spinner" style={{ width: '28px', height: '28px', borderTopColor: 'var(--color-primary)' }} />
          <p>Loading dashboard notices from server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Metric Stat Cards */}
      <div className="stat-cards-grid">
        <div className="stat-card stat-card-urgent">
          <div className="stat-card-icon stat-icon-urgent">
            <AlertCircle size={22} aria-hidden="true" />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Urgent Notices</span>
            <span className="stat-value">{urgentNotices.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon stat-icon-deadlines">
            <Clock size={22} aria-hidden="true" />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Upcoming Deadlines</span>
            <span className="stat-value">{upcomingDeadlines.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon stat-icon-notices">
            <CalendarDays size={22} aria-hidden="true" />
          </div>
          <div className="stat-card-content">
            <span className="stat-label">Active Campus Notices</span>
            <span className="stat-value">{activeNotices.length}</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="dashboard-grid">
        {/* Left Column: Today's Important Notices */}
        <section className="dashboard-section" aria-labelledby="today-notices-title">
          <div className="section-header">
            <div>
              <h2 id="today-notices-title" className="section-title">
                Urgent & Important Notices
              </h2>
              <p className="section-subtitle">Prioritized campus announcements needing action</p>
            </div>
            <button
              type="button"
              className="btn btn-link"
              onClick={() => onNavigate('notices')}
            >
              <span>View All</span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>

          <div className="notice-cards-list">
            {urgentNotices.length > 0 ? (
              urgentNotices.map((notice) => (
                <NoticeCard key={notice.id} notice={notice} />
              ))
            ) : (
              <div className="empty-state empty-state-card">
                <AlertCircle size={28} className="empty-state-icon" aria-hidden="true" />
                <h4 className="empty-state-title">No urgent notices</h4>
                <p className="empty-state-text">You are up to date! No immediate urgent announcements recorded.</p>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Upcoming Deadlines List */}
        <section className="dashboard-section" aria-labelledby="upcoming-deadlines-title">
          <div className="section-header">
            <div>
              <h2 id="upcoming-deadlines-title" className="section-title">
                Upcoming Deadlines List
              </h2>
              <p className="section-subtitle">Academic submissions & exams</p>
            </div>
            <button
              type="button"
              className="btn btn-link"
              onClick={() => onNavigate('calendar')}
            >
              <span>Calendar</span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>

          <div className="notice-cards-list">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.slice(0, 4).map((notice) => (
                <NoticeCard key={notice.id} notice={notice} />
              ))
            ) : (
              <div className="empty-state empty-state-card">
                <Clock size={28} className="empty-state-icon" aria-hidden="true" />
                <h4 className="empty-state-title">No deadlines recorded</h4>
                <p className="empty-state-text">No upcoming assignments or examination deadlines recorded yet.</p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onNavigate('add-notice')}
                  style={{ marginTop: '0.5rem' }}
                >
                  <Plus size={14} aria-hidden="true" />
                  <span>Add First Notice</span>
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
