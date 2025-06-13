import React from 'react';
import { FaThermometerHalf, FaWind, FaTachometerAlt, FaWater, FaAngleDown } from 'react-icons/fa';

const detailIcons = {
    magnitude: <FaTachometerAlt />,
    depth_km: <FaAngleDown />,
    water_level_m: <FaWater />,
    temperature_c: <FaThermometerHalf />,
    wind_speed_kmh: <FaWind />,
};

const formatDetailKey = (key) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

function DisasterDetails({ disaster }) {
    if (!disaster.details) {
        return <p>No specific details available for this event.</p>;
    }

    return (
        <div className="details-list">
            {Object.entries(disaster.details).map(([key, value]) => (
                <div className="detail-item" key={key}>
                    <span className="detail-icon">{detailIcons[key] || '📊'}</span>
                    <span className="detail-key">{formatDetailKey(key)}:</span>
                    <span className="detail-value">{value}</span>
                </div>
            ))}
        </div>
    );
}

export default DisasterDetails;