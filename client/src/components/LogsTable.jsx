import React from 'react';

const LogsTable = ({ logs, loading, sortBy, order, onSort }) => {
  const getSortIndicator = (field) => {
    if (sortBy !== field) return ' ↕';
    return order === 'asc' ? ' ↑' : ' ↓';
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

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading logs...</div>;
  }

  if (!logs || logs.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-white)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <p style={{ color: 'var(--secondary-color)' }}>No logs available. Upload a JSON file to get started or adjust your filters.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th onClick={() => onSort('actor')}>Actor{getSortIndicator('actor')}</th>
            <th>Role</th>
            <th>Action</th>
            <th>Resource</th>
            <th>Resource Type</th>
            <th>IP Address</th>
            <th>Region</th>
            <th onClick={() => onSort('severity')}>Severity{getSortIndicator('severity')}</th>
            <th>Status</th>
            <th onClick={() => onSort('timestamp')}>Timestamp{getSortIndicator('timestamp')}</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id || `${log.timestamp}-${Math.random()}`}>
              <td>{log.actor}</td>
              <td>{log.role}</td>
              <td>{log.action}</td>
              <td>{log.resource}</td>
              <td>{log.resourceType}</td>
              <td>{log.ipAddress}</td>
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
