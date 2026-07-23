import React, { useState, useEffect } from 'react';
import UploadSection from './components/UploadSection';
import FilterBar from './components/FilterBar';
import LogsTable from './components/LogsTable';

function App() {
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination & Sorting state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState('timestamp');
  const [order, setOrder] = useState('desc');

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    action: '',
    severity: '',
    status: '',
    resourceType: '',
    region: ''
  });

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query string
      const queryParams = new URLSearchParams({
        page,
        limit,
        sortBy,
        order,
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/logs?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      const result = await response.json();
      setLogs(result.data);
      setTotalCount(result.pagination.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, limit, sortBy, order, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filtering
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('desc');
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Security Audit Log Dashboard</h1>
      </header>

      <UploadSection onUploadSuccess={fetchLogs} />
      
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <LogsTable 
        logs={logs} 
        loading={loading}
        sortBy={sortBy}
        order={order}
        onSort={handleSort}
      />

      <div className="pagination">
        <div className="pagination-info">
          Showing {logs.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, totalCount)} of {totalCount} records
        </div>
        <div className="pagination-controls">
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
          <button 
            className="btn btn-primary"
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button 
            className="btn btn-primary"
            disabled={page * limit >= totalCount} 
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
