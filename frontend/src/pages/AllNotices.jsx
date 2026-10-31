import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, RotateCcw } from 'lucide-react';
import NoticeCard from '../components/NoticeCard.jsx';
import { CATEGORIES, PRIORITIES } from '../services/mockData.js';

export function AllNotices({ notices = [], isLoading = false, onDeleteNotice, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');

  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      // Search filter across title, description, and venue
      const matchesSearch =
        !searchTerm.trim() ||
        notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.venue?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory =
        selectedCategory === 'All' ||
        notice.category?.toLowerCase() === selectedCategory.toLowerCase();

      // Priority filter
      const matchesPriority =
        selectedPriority === 'All' ||
        notice.priority?.toLowerCase() === selectedPriority.toLowerCase();

      // Date filter
      const matchesDate = !selectedDate || notice.event_date === selectedDate;

      return matchesSearch && matchesCategory && matchesPriority && matchesDate;
    });
  }, [notices, searchTerm, selectedCategory, selectedPriority, selectedDate]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedPriority('All');
    setSelectedDate('');
  };

  const hasActiveFilters =
    searchTerm || selectedCategory !== 'All' || selectedPriority !== 'All' || selectedDate;

  return (
    <div className="page-container">
      {/* Search & Filter Bar */}
      <div className="filter-card">
        <div className="search-bar-row">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" aria-hidden="true" />
            <input
              type="text"
              className="search-input"
              placeholder="Search notices by title, description, or venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search notices"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-outline btn-sm reset-filter-btn"
                onClick={handleResetFilters}
              >
                <RotateCcw size={14} aria-hidden="true" />
                <span>Reset Filters</span>
              </button>
            )}

            {onRefresh && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={onRefresh}
                title="Refresh notices from database"
              >
                <RotateCcw size={14} aria-hidden="true" />
                <span>Sync</span>
              </button>
            )}
          </div>
        </div>

        <div className="filter-controls-row">
          <div className="filter-group">
            <label htmlFor="filter-category" className="filter-label">
              <Filter size={13} aria-hidden="true" />
              <span>Category</span>
            </label>
            <select
              id="filter-category"
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-priority" className="filter-label">
              <span>Priority</span>
            </label>
            <select
              id="filter-priority"
              className="filter-select"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              {PRIORITIES.map((pri) => (
                <option key={pri} value={pri}>
                  {pri}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-date" className="filter-label">
              <Calendar size={13} aria-hidden="true" />
              <span>Date</span>
            </label>
            <input
              id="filter-date"
              type="date"
              className="filter-date-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Notices Count Header */}
      <div className="results-header">
        <span className="results-count">
          Showing <strong>{filteredNotices.length}</strong> of {notices.length} saved notices
        </span>
      </div>

      {/* Notices List, Loading, or Empty State */}
      {isLoading ? (
        <div className="loading-state-box">
          <span className="spinner" style={{ width: '28px', height: '28px', borderTopColor: 'var(--color-primary)' }} />
          <p>Syncing notices from server...</p>
        </div>
      ) : (
        <div className="notices-grid">
          {filteredNotices.length > 0 ? (
            filteredNotices.map((notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                onDelete={onDeleteNotice}
              />
            ))
          ) : (
            <div className="empty-state empty-state-card">
              <div className="empty-state-icon">
                <Filter size={32} aria-hidden="true" />
              </div>
              <h3 className="empty-state-title">No notices found</h3>
              <p className="empty-state-text">
                {hasActiveFilters
                  ? 'No campus notices match your current filter and search criteria.'
                  : 'No notices saved in the database yet. Click "Add Notice" to paste your first announcement.'}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleResetFilters}
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AllNotices;
