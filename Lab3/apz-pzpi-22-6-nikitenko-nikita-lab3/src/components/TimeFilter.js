import React from 'react';

const timePeriods = [
    { label: 'Live', value: 'all' },
    { label: 'Last 3 Days', value: '3d' },
    { label: 'Last 7 Days', value: '7d' },
];

function TimeFilter({ activePeriod, setActivePeriod }) {
    return (
        <div className="time-filter-group">
            {timePeriods.map(period => (
                <button
                    key={period.value}
                    className={`time-filter-button ${activePeriod === period.value ? 'active' : ''}`}
                    onClick={() => setActivePeriod(period.value)}
                >
                    {period.label}
                </button>
            ))}
        </div>
    );
}

export default TimeFilter;