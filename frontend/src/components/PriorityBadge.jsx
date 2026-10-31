import React from 'react';
import { AlertTriangle, AlertCircle, Clock, CheckCircle } from 'lucide-react';

export function PriorityBadge({ priority, status }) {
  if (priority) {
    const isUrgent = priority.toLowerCase() === 'urgent';
    const isImportant = priority.toLowerCase() === 'important';

    let badgeClass = 'badge-normal';
    let Icon = CheckCircle;

    if (isUrgent) {
      badgeClass = 'badge-urgent';
      Icon = AlertCircle;
    } else if (isImportant) {
      badgeClass = 'badge-important';
      Icon = AlertTriangle;
    }

    return (
      <span className={`badge ${badgeClass}`} title={`Priority: ${priority}`}>
        <Icon size={13} aria-hidden="true" />
        <span>{priority}</span>
      </span>
    );
  }

  if (status) {
    const isUrgent = status.toLowerCase() === 'urgent';
    const isExpired = status.toLowerCase() === 'expired';

    let badgeClass = 'status-upcoming';
    let Icon = Clock;

    if (isUrgent) {
      badgeClass = 'status-urgent';
      Icon = AlertCircle;
    } else if (isExpired) {
      badgeClass = 'status-expired';
      Icon = Clock;
    }

    return (
      <span className={`status-pill ${badgeClass}`} title={`Status: ${status}`}>
        <Icon size={12} aria-hidden="true" />
        <span>{status}</span>
      </span>
    );
  }

  return null;
}

export default PriorityBadge;

