import React, { useState } from 'react';

const FilterBar = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  return (
    <section className="filter-bar">
      <div className="filter-group" style={{ flex: 2 }}>
        <label htmlFor="search">Search</label>
        <input 
          type="text" 
          id="search" 
          name="search" 
          placeholder="Actor, Action, Resource, IP..." 
          value={localFilters.search}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="role">Role</label>
        <select id="role" name="role" value={localFilters.role} onChange={handleChange}>
          <option value="">All Roles</option>
          <option value="admin">admin</option>
          <option value="user">user</option>
          <option value="system">system</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="severity">Severity</label>
        <select id="severity" name="severity" value={localFilters.severity} onChange={handleChange}>
          <option value="">All Severities</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="CRITICAL">CRITICAL</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="status">Status</label>
        <select id="status" name="status" value={localFilters.status} onChange={handleChange}>
          <option value="">All Statuses</option>
          <option value="Resolved">Resolved</option>
          <option value="Unresolved">Unresolved</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="resourceType">Resource Type</label>
        <input 
          type="text" 
          id="resourceType" 
          name="resourceType" 
          placeholder="e.g. USER, API" 
          value={localFilters.resourceType}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="region">Region</label>
        <input 
          type="text" 
          id="region" 
          name="region" 
          placeholder="e.g. us-east-1" 
          value={localFilters.region}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>
      
      <div className="filter-group" style={{ flex: 'none' }}>
        <button className="btn btn-primary" onClick={applyFilters}>Apply Filters</button>
      </div>
    </section>
  );
};

export default FilterBar;
