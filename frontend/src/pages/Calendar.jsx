import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import NoticeCard from '../components/NoticeCard.jsx';
import { getTodayDateString } from '../services/noticeUtils.js';

export function Calendar({ notices = [], isLoading = false }) {
  const todayStr = getTodayDateString();
  const [currentDate, setCurrentDate] = useState(() => {
    // If notices exist, default to the month of the first upcoming notice or today
    if (notices.length > 0 && notices[0].event_date) {
      const parts = notices[0].event_date.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
      }
    }
    return new Date();
  });
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
    const newFormattedMonth = String(newDate.getMonth() + 1).padStart(2, '0');
    setSelectedDateStr(`${newDate.getFullYear()}-${newFormattedMonth}-01`);
  };

  const handleNextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    setCurrentDate(newDate);
    const newFormattedMonth = String(newDate.getMonth() + 1).padStart(2, '0');
    setSelectedDateStr(`${newDate.getFullYear()}-${newFormattedMonth}-01`);
  };

  // Group real saved notices by date string (YYYY-MM-DD)
  const noticesByDate = notices.reduce((acc, notice) => {
    if (!notice.event_date) return acc;
    if (!acc[notice.event_date]) {
      acc[notice.event_date] = [];
    }
    acc[notice.event_date].push(notice);
    return acc;
  }, {});

  const selectedNotices = selectedDateStr ? noticesByDate[selectedDateStr] || [] : [];

  // Generate calendar grid cells
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ type: 'empty', key: `empty-${i}` });
  }

  for (let day = 1; day <= totalDaysInMonth; day++) {
    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(month + 1).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    const dayNotices = noticesByDate[dateStr] || [];
    const hasUrgent = dayNotices.some(
      (n) => n.priority?.toLowerCase() === 'urgent' || n.status?.toLowerCase() === 'urgent'
    );
    const hasRegular = dayNotices.length > 0 && !hasUrgent;

    calendarDays.push({
      type: 'day',
      key: dateStr,
      dayNumber: day,
      dateStr,
      noticesCount: dayNotices.length,
      hasUrgent,
      hasRegular,
      isSelected: selectedDateStr === dateStr,
    });
  }

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-state-box">
          <span className="spinner" style={{ width: '28px', height: '28px', borderTopColor: 'var(--color-primary)' }} />
          <p>Loading academic calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="calendar-layout-grid">
        {/* Calendar Grid Section */}
        <section className="calendar-card" aria-label="Monthly Calendar">
          <div className="calendar-header">
            <h2 className="calendar-month-title">
              {monthNames[month]} {year}
            </h2>
            <div className="calendar-nav-buttons">
              <button
                type="button"
                className="btn btn-outline btn-icon"
                onClick={handlePrevMonth}
                aria-label="Previous month"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="btn btn-outline btn-icon"
                onClick={handleNextMonth}
                aria-label="Next month"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-dot dot-urgent" />
              <span>Terracotta: Urgent Deadline</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-regular" />
              <span>Sage Green: Regular Event</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot dot-selected" />
              <span>Forest Green: Selected Date</span>
            </div>
          </div>

          {/* Days of Week */}
          <div className="calendar-grid-header">
            {daysOfWeek.map((dow) => (
              <div key={dow} className="calendar-dow-cell">
                {dow}
              </div>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div className="calendar-grid">
            {calendarDays.map((cell) => {
              if (cell.type === 'empty') {
                return <div key={cell.key} className="calendar-cell cell-empty" />;
              }

              let indicatorClass = '';
              if (cell.hasUrgent) indicatorClass = 'indicator-urgent';
              else if (cell.hasRegular) indicatorClass = 'indicator-regular';

              return (
                <button
                  type="button"
                  key={cell.key}
                  className={`calendar-cell cell-day ${cell.isSelected ? 'cell-selected' : ''}`}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  aria-label={`${cell.dayNumber} ${monthNames[month]} ${year}, ${cell.noticesCount} notices`}
                >
                  <span className="cell-day-number">{cell.dayNumber}</span>
                  {cell.noticesCount > 0 && (
                    <div className="cell-indicator-container">
                      <span className={`cell-indicator-dot ${indicatorClass}`} />
                      <span className="cell-notices-pill">{cell.noticesCount}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Selected Date Notices Detail */}
        <section className="calendar-detail-section" aria-labelledby="selected-date-title">
          <div className="section-header">
            <div>
              <h3 id="selected-date-title" className="section-title">
                Notices for {selectedDateStr || 'Selected Date'}
              </h3>
              <p className="section-subtitle">
                {selectedNotices.length} event(s) scheduled
              </p>
            </div>
          </div>

          <div className="notice-cards-list">
            {selectedNotices.length > 0 ? (
              selectedNotices.map((notice) => (
                <NoticeCard key={notice.id} notice={notice} />
              ))
            ) : (
              <div className="empty-state empty-state-card">
                <CalendarIcon size={32} className="empty-state-icon" aria-hidden="true" />
                <h4 className="empty-state-title">No notices on this date</h4>
                <p className="empty-state-text">
                  Select a highlighted date on the calendar to view scheduled deadlines and announcements.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Calendar;
