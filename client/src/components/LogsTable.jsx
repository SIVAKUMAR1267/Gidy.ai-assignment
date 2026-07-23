import React from 'react';

const LogsTable = ({ logs, loading, sortBy, order, onSort, searchQuery, onClearFilters }) => {
  const handleHeaderClick = (field) => {
    if (sortBy === field) {
      if (order === 'asc') onSort(field, 'desc');
      else if (order === 'desc') onSort('', '');
      else onSort(field, 'asc');
    } else {
      onSort(field, 'asc');
    }
  };

  const getSortIndicator = (field) => {
    if (sortBy !== field || !order) return '';
    return order === 'asc' ? ' ↓' : ' ↑';
  };

  const getSeverityBadge = (severity) => {
    const s = severity?.toLowerCase();
    if (s === 'critical' || s === 'high') return 'badge badge-high';
    if (s === 'medium') return 'badge badge-medium';
    return 'badge badge-low';
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === 'resolved') return 'badge badge-resolved';
    return 'badge badge-unresolved';
  };

  const highlightMatch = (text) => {
    if (!searchQuery || !text) return text;
    const str = String(text);
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = str.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="highlight">{part}</mark> : part
    );
  };

  if (!loading && (!logs || logs.length === 0)) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'var(--bg-white)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px', color: 'var(--dark-text)' }}>No audit logs match the current search and filters.</h3>
        <button className="btn btn-primary" onClick={onClearFilters}>Clear Filters</button>
      </div>
    );
  }

  // Generate 20 skeleton rows
  const skeletonRows = Array.from({ length: 20 }).map((_, i) => (
    <tr key={`skeleton-${i}`}>
      <td><div className="skeleton-box" style={{ width: '100px' }}></div></td>
      <td><div className="skeleton-box" style={{ width: '60px' }}></div></td>
      <td><div className="skeleton-box" style={{ width: '80px' }}></div></td>
      <td><div className="skeleton-box" style={{ width: '120px' }}></div></td>
      <td><div className="skeleton-box" style={{ width: '60px' }}></div></td>
      <td><div className="skeleton-box" style={{ width: '90px' }}></div></td>
      <td><div className="skeleton-box" style={{ width: '70px' }}></div></td>
      <td><div className="skeleton-box" style={{ width: '60px' }}></div></td>
      <td><div className="skeleton-box" style={{ width: '60px' }}></div></td>
      <td><div className="skeleton-box" style={{ width: '140px' }}></div></td>
    </tr>
  ));

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th onClick={() => handleHeaderClick('actor')}>Actor{getSortIndicator('actor')}</th>
            <th onClick={() => handleHeaderClick('role')}>Role{getSortIndicator('role')}</th>
            <th onClick={() => handleHeaderClick('action')}>Action{getSortIndicator('action')}</th>
            <th onClick={() => handleHeaderClick('resource')}>Resource{getSortIndicator('resource')}</th>
            <th onClick={() => handleHeaderClick('resourceType')}>Resource Type{getSortIndicator('resourceType')}</th>
            <th onClick={() => handleHeaderClick('ipAddress')}>IP Address{getSortIndicator('ipAddress')}</th>
            <th onClick={() => handleHeaderClick('region')}>Region{getSortIndicator('region')}</th>
            <th onClick={() => handleHeaderClick('severity')}>Severity{getSortIndicator('severity')}</th>
            <th onClick={() => handleHeaderClick('status')}>Status{getSortIndicator('status')}</th>
            <th onClick={() => handleHeaderClick('timestamp')}>Timestamp{getSortIndicator('timestamp')}</th>
          </tr>
        </thead>
        <tbody>
          {loading ? skeletonRows : logs.map((log) => (
            <tr key={log._id || `${log.timestamp}-${Math.random()}`}>
              <td>{highlightMatch(log.actor)}</td>
              <td>{log.role}</td>
              <td>{highlightMatch(log.action)}</td>
              <td>{highlightMatch(log.resource)}</td>
              <td>{log.resourceType}</td>
              <td>{highlightMatch(log.ipAddress)}</td>
              <td>{log.region}</td>
              <td><span className={getSeverityBadge(log.severity)}>{log.severity}</span></td>
              <td><span className={getStatusBadge(log.status)}>{log.status}</span></td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogsTable;
