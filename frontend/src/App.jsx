import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AllNotices from './pages/AllNotices.jsx';
import AddNotice from './pages/AddNotice.jsx';
import Calendar from './pages/Calendar.jsx';
import WeeklySummary from './pages/WeeklySummary.jsx';
import { fetchNotices, deleteNotice } from './services/api.js';
import { enrichNoticeWithStatus } from './services/noticeUtils.js';
import { AlertCircle, RotateCcw } from 'lucide-react';

export function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const loadNotices = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const data = await fetchNotices({ limit: 100 });
      const rawList = data?.items || [];
      const enriched = rawList.map(enrichNoticeWithStatus);
      setNotices(enriched);
    } catch (err) {
      console.warn('API connection failed; using local fallback:', err.message);
      setApiError('Unable to sync with backend server. Make sure the FastAPI backend is running on port 8000.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  const getPageTitle = () => {
    switch (currentScreen) {
      case 'dashboard':
        return 'Dashboard';
      case 'notices':
        return 'All Notices';
      case 'add-notice':
        return 'Add Notice';
      case 'calendar':
        return 'Notice Calendar';
      case 'summary':
        return 'Weekly Summary';
      default:
        return 'Campus Pulse';
    }
  };

  const handleNoticeSaved = (newNotice) => {
    const enriched = enrichNoticeWithStatus(newNotice);
    setNotices((prev) => [enriched, ...prev]);
    // Switch to notices list to view newly saved notice
    setCurrentScreen('notices');
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) {
      return;
    }

    try {
      await deleteNotice(noticeId);
      setNotices((prev) => prev.filter((n) => n.id !== noticeId));
    } catch (err) {
      alert(`Failed to delete notice: ${err.message}`);
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="app-main-wrapper">
        <Topbar
          pageTitle={getPageTitle()}
          onToggleMobile={() => setMobileOpen((prev) => !prev)}
          onQuickAdd={() => setCurrentScreen('add-notice')}
        />

        <main className="app-content-area">
          {apiError && (
            <div className="alert-banner alert-error" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={18} aria-hidden="true" />
              <div style={{ flex: 1 }}>{apiError}</div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={loadNotices}
                style={{ marginLeft: 'auto' }}
              >
                <RotateCcw size={13} aria-hidden="true" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {currentScreen === 'dashboard' && (
            <Dashboard
              notices={notices}
              onNavigate={setCurrentScreen}
              isLoading={isLoading}
            />
          )}

          {currentScreen === 'notices' && (
            <AllNotices
              notices={notices}
              isLoading={isLoading}
              onDeleteNotice={handleDeleteNotice}
              onRefresh={loadNotices}
            />
          )}

          {currentScreen === 'add-notice' && (
            <AddNotice onNoticeSaved={handleNoticeSaved} />
          )}

          {currentScreen === 'calendar' && (
            <Calendar
              notices={notices}
              isLoading={isLoading}
            />
          )}

          {currentScreen === 'summary' && (
            <WeeklySummary
              notices={notices}
              isLoading={isLoading}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
