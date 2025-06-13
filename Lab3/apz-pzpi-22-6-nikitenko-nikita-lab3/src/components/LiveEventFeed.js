import React from 'react';

const getSeverityStyles = (severity) => {
    if (severity >= 5) return { backgroundColor: 'rgba(248, 81, 73, 0.1)', color: '#F85149' };
    if (severity >= 4) return { backgroundColor: 'rgba(227, 179, 65, 0.1)', color: '#E3B341' };
    if (severity >= 3) return { backgroundColor: 'rgba(88, 166, 255, 0.1)', color: '#58A6FF' };
    return { backgroundColor: 'rgba(63, 185, 80, 0.1)', color: '#3FB950' };
};

const getPrimaryMetric = (disaster) => {
    if (!disaster.details) return `Severity: ${disaster.severity}`;
    switch(disaster.type) {
        case 'Earthquake': return `Mag: ${disaster.details.magnitude}`;
        case 'Hurricane': return `Wind: ${disaster.details.max_wind_speed_kmh} km/h`;
        case 'Flood': return `Level: ${disaster.details.water_level_m} m`;
        case 'Wildfire': return `Temp: ${disaster.details.temperature_c}°C`;
        default: return `Severity: ${disaster.severity}`;
    }
};

const EventCard = ({ disaster, onSelect, isSelected }) => {
    const styles = getSeverityStyles(disaster.severity);
    return (
        <div className={`event-card ${isSelected ? 'selected' : ''}`} onClick={() => onSelect(disaster)}>
            <div className="event-card-header">
                <h3>{disaster.type}</h3>
                <span className="severity-badge" style={{backgroundColor: styles.color}}>
                    {getPrimaryMetric(disaster)}
                </span>
            </div>
            <p className="event-card-time">
                {new Date(disaster.createdAt).toLocaleString()}
            </p>
        </div>
    );
};

function LiveEventFeed({ disasters, onSelectDisaster, selectedDisasterId }) {
  return (
    <div className="event-feed">
        {disasters.map(disaster => (
            <EventCard 
                key={disaster.id}
                disaster={disaster}
                onSelect={onSelectDisaster}
                isSelected={disaster.id === selectedDisasterId}
            />
        ))}
    </div>
  );
}

export default LiveEventFeed;