import React, { useState, useEffect, useCallback } from 'react';
import LayoutEngine from './components/LayoutEngine';
import { LoadingState, ErrorState, OfflineIndicator } from './components/LoadingState';
import ErrorBoundary from './components/ErrorBoundary';
import apiService from './services/api';
import './App.css';

const POLLING_INTERVAL = 10000; // 10 seconds

function App() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchProfile = useCallback(async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
        setError(null);
      }

      const result = await apiService.fetchActiveProfile();
      
      setProfile(result.data);
      setIsOffline(result.fromCache);
      setLastUpdated(new Date());
      
      if (isInitialLoad) {
        setLoading(false);
      }
      
      if (error) {
        setError(null);
      }
      
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      
      if (isInitialLoad) {
        setError(err);
        setLoading(false);
      }
      
      setIsOffline(true);
    }
  }, [error]);

  const handleRetry = useCallback(() => {
    setError(null);
    fetchProfile(true);
  }, [fetchProfile]);

  const handleErrorBoundaryError = useCallback((error, errorInfo) => {
    console.error('Application error:', error, errorInfo);
    setError(new Error('A critical error occurred while rendering the application'));
  }, []);

  useEffect(() => {
    fetchProfile(true);
  }, [fetchProfile]);

  useEffect(() => {
    if (!profile || loading || error) {
      return;
    }

    const interval = setInterval(() => {
      fetchProfile(false);
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [profile, loading, error, fetchProfile]);

  useEffect(() => {
    const handleOnline = () => {
      console.log('Connection restored, fetching latest profile...');
      fetchProfile(false);
    };

    const handleOffline = () => {
      console.log('Connection lost, using cached data...');
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchProfile]);

  if (loading) {
    return <LoadingState message="Loading profile..." />;
  }

  if (error && !profile) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  return (
    <ErrorBoundary 
      onError={handleErrorBoundaryError}
      onRetry={handleRetry}
    >
      <div className="app">
        <OfflineIndicator isVisible={isOffline} />
        
        {profile ? (
          <LayoutEngine profile={profile} />
        ) : (
          <div className="loading-container">
            <div className="loading-text">No profile data available</div>
            <button className="retry-button" onClick={handleRetry}>
              Retry
            </button>
          </div>
        )}
        
        {process.env.NODE_ENV === 'development' && lastUpdated && (
          <div style={{
            position: 'fixed',
            bottom: '8px',
            right: '8px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;