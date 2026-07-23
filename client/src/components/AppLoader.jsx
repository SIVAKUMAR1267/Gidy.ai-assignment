import React from 'react';

const AppLoader = ({ statusText, hasTimeout, onRetry }) => {
  return (
    <div className="app-loader">
      <div className="loader-content">
        <div className="loader-header">
          <div className="logo-placeholder"></div>
          <h2>Security Audit Dashboard</h2>
        </div>
        
        {!hasTimeout ? (
          <div className="loader-status">
            {statusText !== 'Connected ✓' && <div className="spinner"></div>}
            <p className={statusText === 'Connected ✓' ? 'status-success' : 'status-text'}>
              {statusText}
            </p>
            {statusText === 'Starting server...' && (
              <p className="status-subtext">This can take up to a minute if the backend is waking from sleep.</p>
            )}
          </div>
        ) : (
          <div className="loader-timeout">
            <p className="status-error">{statusText}</p>
            <button className="btn btn-primary" onClick={onRetry}>Retry Connection</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppLoader;
