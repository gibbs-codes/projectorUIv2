import { useState, useEffect, useRef, useCallback } from 'react';

const useDashboardApi = (baseUrl, pollInterval = 30000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const intervalRef = useRef(null);
  const abortControllerRef = useRef(null);

  const fetchDashboardData = useCallback(async () => {
    if (!baseUrl) return;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      console.log('📡 Fetching dashboard data:', `${baseUrl}/dashboard/data`);
      setError(null);

      const response = await fetch(`${baseUrl}/dashboard/data`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('✅ Dashboard data received:', responseData);

      // Handle nested structure: response.data.data
      if (responseData.success && responseData.data) {
        setData(responseData.data);
        setLastFetch(new Date());
        setLoading(false);
        console.log('📊 Current mode:', responseData.data.currentMode || responseData.data.mode);
      } else {
        throw new Error('Invalid response format - missing data field');
      }

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('🚫 Request was cancelled');
        return;
      }

      console.log('❌ Error fetching dashboard data:', err.message);
      setError(err.message);
      setLoading(false);
    }
  }, [baseUrl]);

  // Set up polling
  useEffect(() => {
    if (!baseUrl) {
      setLoading(false);
      return;
    }

    console.log('🔄 Setting up dashboard polling every', pollInterval / 1000, 'seconds');

    // Initial fetch
    fetchDashboardData();

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      fetchDashboardData();
    }, pollInterval);

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up dashboard polling');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [baseUrl, pollInterval, fetchDashboardData]);

  const refreshData = useCallback(() => {
    console.log('🔄 Manual refresh requested');
    setLoading(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const changeMode = useCallback(async (newMode) => {
    if (!baseUrl) return;

    try {
      console.log('🔄 Changing dashboard mode to:', newMode);

      const response = await fetch(`${baseUrl}/dashboard/mode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode: newMode }),
      });

      if (!response.ok) {
        throw new Error(`Failed to change mode: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Mode changed:', result);

      // API now maintains mode state internally, so next poll will get new data
    } catch (err) {
      console.log('❌ Error changing mode:', err.message);
      setError(err.message);
    }
  }, [baseUrl]);

  return {
    data,
    loading,
    error,
    lastFetch,
    refreshData,
    changeMode
  };
};

export default useDashboardApi;