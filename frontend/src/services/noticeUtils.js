/**
 * Utilities for formatting and computing dynamic status for notices.
 */

export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function computeNoticeStatus(notice) {
  if (!notice) return 'Upcoming';
  if (notice.status) return notice.status;

  const todayStr = getTodayDateString();
  if (notice.event_date && notice.event_date < todayStr) {
    return 'Expired';
  }

  if (notice.priority?.toLowerCase() === 'urgent') {
    return 'Urgent';
  }

  return 'Upcoming';
}

export function enrichNoticeWithStatus(notice) {
  return {
    ...notice,
    status: computeNoticeStatus(notice),
  };
}

