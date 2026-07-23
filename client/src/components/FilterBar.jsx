import React, { useState, useEffect } from 'react';

const FilterBar = ({ filters, onFilterChange, onClear }) => {
  const [options, setOptions] = useState({
    role: [],
    action: [],
    severity: [],
    status: [],
    region: [],
    resourceType: []
  });

  useEffect(() => {
    // Fetch filter options only once and cache in state
    const fetchOptions = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/logs/filters`);
        if (res.ok) {
          const data = await res.json();
          setOptions(data);
        }
      } catch (err) {
        console.error('Failed to fetch filter options', err);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const activeCount = Object.entries(filters).filter(([k, v]) => k !== 'search' && v !== '').length;
  const isSearchActive = filters.search !== '';

  return (
    <section className="filter-bar">
      <div className="filter-header" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600' }}>
          Filters {activeCount > 0 && <span className="badge badge-medium" style={{ marginLeft: '8px' }}>{activeCount} Active</span>}
        </h3>
        {(activeCount > 0 || isSearchActive) && (
          <button className="btn" onClick={onClear} style={{ backgroundColor: 'transparent', color: 'var(--danger-color)', textDecoration: 'underline' }}>
            Clear Filters
          </button>
        )}
      </div>

      <div className="filter-group" style={{ flex: 2, minWidth: '200px' }}>
        <label htmlFor="search">Search</label>
        <input 
          type="text" 
          id="search" 
          name="search" 
          placeholder="Actor, Action, Resource, IP..." 
          value={filters.search}
          onChange={handleChange}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="role">Role</label>
        <select id="role" name="role" value={filters.role} onChange={handleChange}>
          <option value="">All Roles</option>
          {options.role.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="severity">Severity</label>
        <select id="severity" name="severity" value={filters.severity} onChange={handleChange}>
          <option value="">All Severities</option>
          {options.severity.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="status">Status</label>
        <select id="status" name="status" value={filters.status} onChange={handleChange}>
          <option value="">All Statuses</option>
          {options.status.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="action">Action</label>
        <select id="action" name="action" value={filters.action} onChange={handleChange}>
          <option value="">All Actions</option>
          {options.action.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="resourceType">Resource Type</label>
        <select id="resourceType" name="resourceType" value={filters.resourceType} onChange={handleChange}>
          <option value="">All Types</option>
          {options.resourceType.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="region">Region</label>
        <select id="region" name="region" value={filters.region} onChange={handleChange}>
          <option value="">All Regions</option>
          {options.region.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    </section>
  );
};

export default FilterBar;
