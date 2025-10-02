// Dynamic configuration based on environment and hostname

/**
 * Determines the API base URL based on environment and current hostname
 */
export const API_BASE_URL = (() => {
  // In development, always use localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:3006/api';
  }

  // In production, use the current hostname with port 3006
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  // Use the same protocol (http/https) as the current page
  return `${protocol}//${hostname}:3006/api`;
})();

/**
 * Determines the WebSocket URL based on environment and current hostname
 */
export const WS_URL = (() => {
  // In development, always use localhost
  if (import.meta.env.DEV) {
    return 'ws://localhost:3006';
  }

  // In production, use the current hostname with port 3006
  const hostname = window.location.hostname;
  const isSecure = window.location.protocol === 'https:';
  const wsProtocol = isSecure ? 'wss:' : 'ws:';

  return `${wsProtocol}//${hostname}:3006`;
})();

/**
 * Default dashboard mode
 */
export const DEFAULT_MODE = import.meta.env.VITE_DEFAULT_MODE || 'personal';

/**
 * Refresh interval in milliseconds
 */
export const REFRESH_INTERVAL = parseInt(import.meta.env.VITE_REFRESH_INTERVAL) || 30000;

/**
 * Whether to enable mock data (primarily for development)
 */
export const ENABLE_MOCK_DATA = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';

// Debug logging in development
if (import.meta.env.DEV) {
  console.log('🔧 Dashboard Configuration:', {
    API_BASE_URL,
    WS_URL,
    DEFAULT_MODE,
    REFRESH_INTERVAL,
    ENABLE_MOCK_DATA,
    currentHostname: window.location.hostname,
    currentProtocol: window.location.protocol,
    isDev: import.meta.env.DEV
  });
}