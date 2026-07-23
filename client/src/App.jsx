import React from 'react';
import useBackendHealth from './hooks/useBackendHealth';
import AppLoader from './components/AppLoader';
import Dashboard from './Dashboard';

function App() {
  const { isAwake, statusText, hasTimeout, retry } = useBackendHealth();

  if (!isAwake) {
    return (
      <AppLoader 
        statusText={statusText} 
        hasTimeout={hasTimeout} 
        onRetry={retry} 
      />
    );
  }

  return <Dashboard />;
}

export default App;
