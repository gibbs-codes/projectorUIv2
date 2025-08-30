import React from 'react';

const LoadingState = ({ message = 'Loading...', showSpinner = true }) => {
  return (
    <div className="loading-container">
      {showSpinner && <div className="loading-spinner" />}
      <div className="loading-text">{message}</div>
    </div>
  );
};

const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="error-container">
      <div className="error-message">
        <h2>Something went wrong</h2>
        <p>{error?.message || 'An unexpected error occurred'}</p>
      </div>
      {onRetry && (
        <button className="retry-button" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};

const OfflineIndicator = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="offline-indicator">
      Using cached data - Check your internet connection
    </div>
  );
};

export { LoadingState, ErrorState, OfflineIndicator };