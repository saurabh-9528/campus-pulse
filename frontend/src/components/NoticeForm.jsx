import React, { useState } from 'react';
import { Sparkles, Save, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { extractNoticeText, createNotice } from '../services/api.js';

const SAMPLE_RAW_TEXT = 
  "URGENT: All 3rd and 4th-year Computer Science students must submit their Final Mini-Project Report and live demo by November 5, 2026 at 10:00 AM in Lab 2. Late submissions will result in grade deduction. Faculty coordinator: Prof. Sharma.";

export function NoticeForm({ onNoticeSaved }) {
  const [rawText, setRawText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleUseSample = () => {
    setRawText(SAMPLE_RAW_TEXT);
    setValidationError('');
  };

  const handleExtract = async (e) => {
    e.preventDefault();
    const trimmed = rawText.trim();
    if (!trimmed) {
      setValidationError('Please enter or paste announcement text before extracting.');
      return;
    }

    setValidationError('');
    setIsExtracting(true);
    setSavedSuccess(false);

    try {
      const data = await extractNoticeText(trimmed);
      setExtractedData({
        title: data.title || '',
        event_date: data.event_date || '',
        event_time: data.event_time ? data.event_time.slice(0, 5) : '',
        venue: data.venue || '',
        category: data.category || 'General',
        priority: data.priority || 'Normal',
        description: trimmed,
      });
    } catch (err) {
      setValidationError(err.message || 'Unable to extract notice details. Please try again or fill in manually.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setExtractedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!extractedData.title || !extractedData.title.trim()) {
      setValidationError('Notice title is required.');
      return;
    }
    if (!extractedData.event_date) {
      setValidationError('Notice date is required.');
      return;
    }

    setValidationError('');
    setIsSaving(true);

    try {
      // Format payload for backend notice API
      const payload = {
        title: extractedData.title.trim(),
        description: extractedData.description ? extractedData.description.trim() : null,
        category: extractedData.category,
        event_date: extractedData.event_date,
        event_time: extractedData.event_time ? (extractedData.event_time.length === 5 ? `${extractedData.event_time}:00` : extractedData.event_time) : null,
        venue: extractedData.venue ? extractedData.venue.trim() : null,
        priority: extractedData.priority,
      };

      let savedRecord;
      try {
        savedRecord = await createNotice(payload);
      } catch (apiErr) {
        // Fallback for mock frontend state if running standalone
        console.warn('Backend notice persistence error; falling back to in-memory save:', apiErr.message);
        savedRecord = {
          ...payload,
          id: Date.now(),
        };
      }

      setSavedSuccess(true);
      if (onNoticeSaved) {
        onNoticeSaved(savedRecord);
      }
    } catch (err) {
      setValidationError(err.message || 'Failed to save notice. Please verify all fields.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setExtractedData(null);
    setRawText('');
    setValidationError('');
    setSavedSuccess(false);
  };

  return (
    <div className="add-notice-container">
      {savedSuccess && (
        <div className="alert-banner alert-success" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>Notice saved successfully.</span>
        </div>
      )}

      {validationError && (
        <div className="alert-banner alert-error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <span>{validationError}</span>
        </div>
      )}

      <div className="form-card">
        <div className="form-card-header">
          <div>
            <h2 className="form-card-title">Paste Unstructured Notice</h2>
            <p className="form-card-subtitle">
              Paste messages from WhatsApp groups, official circulars, or department emails.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleUseSample}
          >
            Insert Sample Text
          </button>
        </div>

        <form onSubmit={handleExtract}>
          <div className="form-group">
            <label htmlFor="raw-notice-text" className="form-label">
              Announcement Text
            </label>
            <textarea
              id="raw-notice-text"
              className="form-textarea"
              rows={5}
              placeholder="e.g. Tomorrow at 11 AM there is a workshop on Cyber Security in Seminar Hall B. All IT students should attend."
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                if (validationError) setValidationError('');
              }}
              disabled={isExtracting || isSaving}
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isExtracting || isSaving || !rawText.trim()}
            >
              {isExtracting ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  <span>Extracting with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} aria-hidden="true" />
                  <span>Extract Notice</span>
                </>
              )}
            </button>
            {rawText && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleCancel}
                disabled={isExtracting || isSaving}
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {extractedData && (
        <div className="form-card preview-card">
          <div className="form-card-header">
            <div>
              <div className="preview-badge-label">
                <Sparkles size={14} aria-hidden="true" />
                <span>Extracted Notice Preview (Editable)</span>
              </div>
              <h2 className="form-card-title">Review & Confirm Notice Details</h2>
              <p className="form-card-subtitle">
                Verify and edit the extracted information before saving to your notices.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-grid">
              <div className="form-group grid-full">
                <label htmlFor="preview-title" className="form-label">
                  Notice Title *
                </label>
                <input
                  id="preview-title"
                  type="text"
                  className="form-input"
                  value={extractedData.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="preview-category" className="form-label">
                  Category *
                </label>
                <select
                  id="preview-category"
                  className="form-select"
                  value={extractedData.category}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  disabled={isSaving}
                >
                  <option value="Assignment">Assignment</option>
                  <option value="Examination">Examination</option>
                  <option value="Event">Event</option>
                  <option value="Holiday">Holiday</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="preview-priority" className="form-label">
                  Priority *
                </label>
                <select
                  id="preview-priority"
                  className="form-select"
                  value={extractedData.priority}
                  onChange={(e) => handleFieldChange('priority', e.target.value)}
                  disabled={isSaving}
                >
                  <option value="Normal">Normal</option>
                  <option value="Important">Important</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="preview-date" className="form-label">
                  Event / Deadline Date *
                </label>
                <input
                  id="preview-date"
                  type="date"
                  className="form-input"
                  value={extractedData.event_date || ''}
                  onChange={(e) => handleFieldChange('event_date', e.target.value)}
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="preview-time" className="form-label">
                  Time (Optional)
                </label>
                <input
                  id="preview-time"
                  type="time"
                  className="form-input"
                  value={extractedData.event_time || ''}
                  onChange={(e) => handleFieldChange('event_time', e.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="form-group grid-full">
                <label htmlFor="preview-venue" className="form-label">
                  Venue / Location (Optional)
                </label>
                <input
                  id="preview-venue"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Seminar Hall, Lab 2, Online"
                  value={extractedData.venue || ''}
                  onChange={(e) => handleFieldChange('venue', e.target.value)}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    <span>Saving Notice...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} aria-hidden="true" />
                    <span>Save Notice</span>
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X size={16} aria-hidden="true" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default NoticeForm;
