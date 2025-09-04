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
    console.log('🚀 APP: Starting fetchProfile, isInitialLoad:', isInitialLoad);
    
    try {
      if (isInitialLoad) {
        console.log('🚀 APP: Initial load - setting loading state');
        setLoading(true);
        setError(null);
      }

      const result = await apiService.fetchActiveProfile();
      console.log('📥 APP: Received result from API service:', {
        hasData: !!result.data,
        fromCache: result.fromCache,
        dataKeys: result.data ? Object.keys(result.data) : null
      });
      
      if (result.data) {
        console.log('📊 APP: Profile data structure:', {
          id: result.data.id,
          name: result.data.name,
          hasGridConfig: !!result.data.gridConfig,
          gridConfig: result.data.gridConfig,
          zonesIsArray: Array.isArray(result.data.zones),
          zonesCount: result.data.zones?.length || 0,
          zones: result.data.zones?.map(z => ({
            id: z.id,
            name: z.name,
            gridArea: z.gridArea,
            cardsCount: z.cards?.length || 0
          })) || []
        });
        
        // Validate profile structure before setting state
        if (!result.data.gridConfig) {
          console.error('❌ APP: Profile missing gridConfig!');
        }
        if (!Array.isArray(result.data.zones)) {
          console.error('❌ APP: Profile zones is not an array:', typeof result.data.zones);
        }
        if (result.data.zones?.length === 0) {
          console.warn('⚠️ APP: Profile has no zones!');
        }
      }
      
      console.log('💾 APP: Setting profile state...');
      setProfile(result.data);
      setIsOffline(result.fromCache);
      setLastUpdated(new Date());
      
      if (isInitialLoad) {
        console.log('✅ APP: Initial load complete, clearing loading state');
        setLoading(false);
      }
      
      if (error) {
        console.log('✅ APP: Clearing previous error state');
        setError(null);
      }
      
    } catch (err) {
      console.error('❌ APP: Failed to fetch profile:', err);
      console.log('📍 APP: Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      if (isInitialLoad) {
        console.log('❌ APP: Setting error state for initial load');
        setError(err);
        setLoading(false);
      }
      
      console.log('📡 APP: Setting offline state');
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
    console.log('🚀 APP: Initial useEffect triggered, starting profile fetch');
    fetchProfile(true);
  }, [fetchProfile]);

  useEffect(() => {
    console.log('🔄 APP: Profile state changed:', {
      hasProfile: !!profile,
      profileId: profile?.id,
      profileName: profile?.name,
      zonesCount: profile?.zones?.length || 0
    });
  }, [profile]);

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

  console.log('🎨 APP: Rendering with state:', {
    loading,
    hasError: !!error,
    hasProfile: !!profile,
    isOffline,
    profileId: profile?.id,
    profileName: profile?.name
  });

  if (loading) {
    console.log('🎨 APP: Rendering loading state');
    return <LoadingState message="Loading profile..." />;
  }

  if (error && !profile) {
    console.log('🎨 APP: Rendering error state:', error.message);
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  console.log('🎨 APP: Rendering main application');
  console.log('🎨 APP: Profile to pass to LayoutEngine:', profile ? {
    id: profile.id,
    name: profile.name,
    hasGridConfig: !!profile.gridConfig,
    zonesCount: profile.zones?.length || 0
  } : null);

  return (
    <ErrorBoundary 
      onError={handleErrorBoundaryError}
      onRetry={handleRetry}
    >
      <div className="app">
        <OfflineIndicator isVisible={isOffline} />
        
        {profile ? (
          <>
            {console.log('🎨 APP: Rendering LayoutEngine with profile')}
            <LayoutEngine profile={profile} />
          </>
        ) : (
          <>
            {console.log('🎨 APP: Rendering no profile fallback')}
            <div className="loading-container">
              <div className="loading-text">No profile data available</div>
              <button className="retry-button" onClick={handleRetry}>
                Retry
              </button>
            </div>
          </>
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