import React, { useState, useEffect, useRef } from 'react';
import UploadSection from './components/UploadSection';
import FilterBar from './components/FilterBar';
import LogsTable from './components/LogsTable';

function App() {
  const getInitialState = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      page: parseInt(params.get('page')) || 1,
      limit: parseInt(params.get('limit')) || 20,
      sortBy: params.get('sortBy') || '',
      order: params.get('order') || '',
      filters: {
        search: params.get('search') || '',
        role: params.get('role') || '',
        action: params.get('action') || '',
        severity: params.get('severity') || '',
        status: params.get('status') || '',
        resourceType: params.get('resourceType') || '',
        region: params.get('region') || ''
      }
    };
  };

  const initialState = getInitialState();

  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(initialState.page);
  const [limit, setLimit] = useState(initialState.limit);
  const [sortBy, setSortBy] = useState(initialState.sortBy);
  const [order, setOrder] = useState(initialState.order);
  const [filters, setFilters] = useState(initialState.filters);

  const abortControllerRef = useRef(null);
  
  // Debounce ref for search
  const debounceTimeoutRef = useRef(null);

  const fetchLogs = async (currentPage, currentLimit, currentSortBy, currentOrder, currentFilters) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (currentPage) queryParams.set('page', currentPage);
      if (currentLimit) queryParams.set('limit', currentLimit);
      if (currentSortBy) queryParams.set('sortBy', currentSortBy);
      if (currentOrder) queryParams.set('order', currentOrder);

      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) queryParams.set(key, value);
      });

      // Update URL State without reloading
      window.history.replaceState({}, "", `?${queryParams.toString()}`);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/logs?${queryParams.toString()}`, {
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) throw new Error('Failed to fetch logs');
      
      const result = await response.json();
      setLogs(result.data);
      setTotalCount(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only debounce if search is the thing changing rapidly
    // A simple approach is to always debounce fetching slightly, except initial load
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    
    debounceTimeoutRef.current = setTimeout(() => {
      fetchLogs(page, limit, sortBy, order, filters);
    }, 300);

    return () => clearTimeout(debounceTimeoutRef.current);
  }, [page, limit, sortBy, order, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '', role: '', action: '', severity: '', status: '', resourceType: '', region: ''
    });
    setSortBy('');
    setOrder('');
    setPage(1);
  };

  const handleSort = (field, newOrder) => {
    setSortBy(field);
    setOrder(newOrder);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Security Audit Log Dashboard</h1>
      </header>

      <UploadSection onUploadSuccess={() => fetchLogs(page, limit, sortBy, order, filters)} />
      
      <FilterBar 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onClear={clearFilters} 
      />
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <LogsTable 
        logs={logs} 
        loading={loading}
        sortBy={sortBy}
        order={order}
        onSort={handleSort}
        searchQuery={filters.search}
        onClearFilters={clearFilters}
      />

      <div className="pagination">
        <div className="pagination-info">
          Showing {logs.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, totalCount)} of {totalCount} records
        </div>
        <div className="pagination-controls">
          <select 
            value={limit} 
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            disabled={loading}
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
          <button 
            className="btn btn-primary"
            disabled={page <= 1 || loading} 
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button 
            className="btn btn-primary"
            disabled={page >= totalPages || loading} 
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
