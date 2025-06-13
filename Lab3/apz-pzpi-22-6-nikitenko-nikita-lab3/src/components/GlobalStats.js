import React from 'react';

const StatItem = ({ value, label }) => (
    <div className="stat-item">
        <div className="value">{value}</div>
        <div className="label">{label}</div>
    </div>
);

function GlobalStats({ disasters }) {
    const activeCount = disasters.filter(d => d.status === 'active').length;
    const totalCount = disasters.length;
    
    return (
        <div className="global-stats">
            <h2>Global Statistics</h2>
            <div className="stats-grid">
                <StatItem value={activeCount} label="Active Events" />
                <StatItem value={totalCount} label="Total (24h)" />
            </div>
        </div>
    );
}

export default GlobalStats;