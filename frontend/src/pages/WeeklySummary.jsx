import React, { useState } from 'react';
import { Sparkles, AlertCircle, Clock, Calendar, CheckCircle } from 'lucide-react';

export function WeeklySummary({ notices = [], isLoading = false }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  // Group active saved notices (excluding expired)
  const activeNotices = notices.filter((n) => n.status?.toLowerCase() !== 'expired');

  const urgentItems = activeNotices.filter(
    (n) => n.priority?.toLowerCase() === 'urgent' || n.status?.toLowerCase() === 'urgent'
  );

  const deadlineItems = activeNotices.filter(
    (n) => n.category?.toLowerCase() === 'assignment' || n.category?.toLowerCase() === 'examination'
  );

  const eventItems = activeNotices.filter(
    (n) => n.category?.toLowerCase() === 'event' || n.category?.toLowerCase() === 'holiday'
  );

  const handleGenerateSummary = () => {
    setIsGenerating(true);

    // Synthesize structured summary directly from real saved notices
    setTimeout(() => {
      setSummaryData({
        generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        urgentNotices: urgentItems.map((n) => ({
          id: n.id,
          title: n.title,
          detail: `${n.event_date ? `Date: ${n.event_date}` : 'No deadline'}${n.event_time ? ` at ${n.event_time.slice(0, 5)}` : ''} • ${n.venue || 'Campus'}`,
        })),
        importantDeadlines: deadlineItems.map((n) => ({
          id: n.id,
          title: n.title,
          detail: `${n.category}: ${n.event_date} • ${n.venue || 'Department Hall'}`,
        })),
        upcomingEvents: eventItems.map((n) => ({
          id: n.id,
          title: n.title,
          detail: `${n.event_date ? n.event_date : 'Scheduled'} • ${n.venue || 'Campus-wide'}`,
        })),
      });
      setIsGenerating(false);
    }, 400);
  };

  const hasNotices = notices.length > 0;

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-state-box">
          <span className="spinner" style={{ width: '28px', height: '28px', borderTopColor: 'var(--color-primary)' }} />
          <p>Syncing saved notices for weekly briefing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="summary-hero-card">
        <div className="summary-hero-content">
          <div className="summary-badge">
            <Sparkles size={14} aria-hidden="true" />
            <span>Weekly Notice Digest</span>
          </div>
          <h2 className="summary-hero-title">What do I need to know this week?</h2>
          <p className="summary-hero-text">
            Get an instant, synthesized overview of upcoming academic deadlines, urgent department
            notices, and scheduled events distilled from your actual saved notices.
          </p>

          <div className="summary-hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleGenerateSummary}
              disabled={isGenerating || !hasNotices}
            >
              {isGenerating ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  <span>Synthesizing Saved Notices...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} aria-hidden="true" />
                  <span>Generate Weekly Summary</span>
                </>
              )}
            </button>
            {!hasNotices && (
              <span className="summary-disabled-note">
                No notices are available for the selected week. Add notices first to generate a summary.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Generated Summary View */}
      {summaryData && (
        <div className="summary-results-container">
          <div className="summary-results-header">
            <h3 className="section-title">Weekly Digest Breakdown</h3>
            <span className="summary-timestamp">Generated at {summaryData.generatedAt}</span>
          </div>

          <div className="summary-grid">
            {/* Urgent Notices Section */}
            <div className="summary-column summary-col-urgent">
              <div className="summary-col-header">
                <AlertCircle size={18} className="summary-icon-urgent" aria-hidden="true" />
                <h4 className="summary-col-title">Urgent Notices</h4>
              </div>
              <div className="summary-items-list">
                {summaryData.urgentNotices.length > 0 ? (
                  summaryData.urgentNotices.map((item) => (
                    <div key={item.id} className="summary-item summary-item-urgent">
                      <p className="summary-item-title">{item.title}</p>
                      <span className="summary-item-detail">{item.detail}</span>
                    </div>
                  ))
                ) : (
                  <p className="summary-empty-msg">No urgent notices requiring immediate attention this week.</p>
                )}
              </div>
            </div>

            {/* Important Deadlines Section */}
            <div className="summary-column summary-col-deadlines">
              <div className="summary-col-header">
                <Clock size={18} className="summary-icon-deadlines" aria-hidden="true" />
                <h4 className="summary-col-title">Important Deadlines</h4>
              </div>
              <div className="summary-items-list">
                {summaryData.importantDeadlines.length > 0 ? (
                  summaryData.importantDeadlines.map((item) => (
                    <div key={item.id} className="summary-item">
                      <p className="summary-item-title">{item.title}</p>
                      <span className="summary-item-detail">{item.detail}</span>
                    </div>
                  ))
                ) : (
                  <p className="summary-empty-msg">No deadlines recorded for this week.</p>
                )}
              </div>
            </div>

            {/* Upcoming Events Section */}
            <div className="summary-column summary-col-events">
              <div className="summary-col-header">
                <Calendar size={18} className="summary-icon-events" aria-hidden="true" />
                <h4 className="summary-col-title">Upcoming Events</h4>
              </div>
              <div className="summary-items-list">
                {summaryData.upcomingEvents.length > 0 ? (
                  summaryData.upcomingEvents.map((item) => (
                    <div key={item.id} className="summary-item">
                      <p className="summary-item-title">{item.title}</p>
                      <span className="summary-item-detail">{item.detail}</span>
                    </div>
                  ))
                ) : (
                  <p className="summary-empty-msg">No general events or holidays scheduled this week.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Initial state before generation */}
      {!summaryData && hasNotices && (
        <div className="empty-state empty-state-card" style={{ marginTop: '1.5rem' }}>
          <Sparkles size={32} className="empty-state-icon" aria-hidden="true" />
          <h3 className="empty-state-title">Ready to summarize</h3>
          <p className="empty-state-text">
            Click "Generate Weekly Summary" above to synthesize your {notices.length} actual saved notices into actionable priorities.
          </p>
        </div>
      )}
    </div>
  );
}

export default WeeklySummary;
