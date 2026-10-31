import React from 'react';
import { Calendar, Clock, MapPin, Tag, Trash2 } from 'lucide-react';
import PriorityBadge from './PriorityBadge.jsx';
import { computeNoticeStatus } from '../services/noticeUtils.js';

export function NoticeCard({ notice, onDelete }) {
  if (!notice) return null;

  const status = notice.status || computeNoticeStatus(notice);
  const isUrgent = notice.priority?.toLowerCase() === 'urgent' || status.toLowerCase() === 'urgent';

  return (
    <article className={`notice-card ${isUrgent ? 'notice-card-urgent' : ''}`}>
      <div className="notice-card-header">
        <div className="notice-badges">
          <span className="category-badge">
            <Tag size={12} aria-hidden="true" />
            <span>{notice.category || 'General'}</span>
          </span>
          <PriorityBadge priority={notice.priority} />
          <PriorityBadge status={status} />
        </div>

        {onDelete && (
          <button
            type="button"
            className="notice-delete-btn"
            onClick={() => onDelete(notice.id)}
            title="Delete this notice"
            aria-label={`Delete notice: ${notice.title}`}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <h3 className="notice-card-title">{notice.title}</h3>

      {notice.description && (
        <p className="notice-card-description">{notice.description}</p>
      )}

      <div className="notice-card-meta">
        <div className="meta-item">
          <Calendar size={14} className="meta-icon" aria-hidden="true" />
          <span>{notice.event_date || 'No date'}</span>
        </div>

        {notice.event_time && (
          <div className="meta-item">
            <Clock size={14} className="meta-icon" aria-hidden="true" />
            <span>{notice.event_time.slice(0, 5)}</span>
          </div>
        )}

        {notice.venue && (
          <div className="meta-item">
            <MapPin size={14} className="meta-icon" aria-hidden="true" />
            <span>{notice.venue}</span>
          </div>
        )}
      </div>
    </article>
  );
}

export default NoticeCard;
