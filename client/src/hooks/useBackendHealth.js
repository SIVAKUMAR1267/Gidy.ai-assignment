import { useState, useEffect, useCallback, useRef } from 'react';

const useBackendHealth = () => {
  const [isAwake, setIsAwake] = useState(false);
  const [statusText, setStatusText] = useState('Starting server...');
  const [hasTimeout, setHasTimeout] = useState(false);
  
  const attemptRef = useRef(0);
  const timerRef = useRef(null);
  const elapsedRef = useRef(0);
  const abortControllerRef = useRef(null);

  const checkHealth = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/health`, {
        signal: abortControllerRef.current.signal
      });
      
      if (response.ok) {
        setStatusText('Connected ✓');
        // Smooth transition
        setTimeout(() => setIsAwake(true), 300);
        return true;
      }
    } catch (err) {
      // Ignore network errors, keep polling
    }
    return false;
  }, []);

  const startPolling = useCallback(() => {
    setHasTimeout(false);
    setIsAwake(false);
    setStatusText('Starting server...');
    attemptRef.current = 0;
    elapsedRef.current = 0;

    const poll = async () => {
      // 60-second absolute timeout limit
      if (elapsedRef.current >= 60000) {
        setHasTimeout(true);
        setStatusText('The server is taking longer than expected to start. This can happen if the hosting provider has put the backend to sleep.');
        return;
      }

      const success = await checkHealth();
      
      if (!success) {
        setStatusText('Checking server...');
        attemptRef.current += 1;
        
        // Capped exponential backoff (1s, 2s, 4s, 5s, 5s...)
        const backoffDelay = Math.min(Math.pow(2, attemptRef.current - 1) * 1000, 5000);
        elapsedRef.current += backoffDelay;
        
        timerRef.current = setTimeout(poll, backoffDelay);
      }
    };

    poll();
  }, [checkHealth]);

  useEffect(() => {
    startPolling();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [startPolling]);

  const retry = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    startPolling();
  }, [startPolling]);

  return { isAwake, statusText, hasTimeout, retry };
};

export default useBackendHealth;
