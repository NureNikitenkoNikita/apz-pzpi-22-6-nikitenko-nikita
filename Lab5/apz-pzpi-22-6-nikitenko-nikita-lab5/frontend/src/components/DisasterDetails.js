import React from 'react';
import { FaThermometerHalf, FaWind, FaTachometerAlt, FaWater, FaAngleDown, FaGlobe, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { WiTornado, WiTsunami, WiVolcano } from 'react-icons/wi';
import RelatedEvents from './RelatedEvents';
import SensorDataChart from './SensorDataChart';

const detailIcons = {
    magnitude: <FaTachometerAlt />,
    depth_km: <FaAngleDown />,
    water_level_m: <FaWater />,
    temperature_c: <FaThermometerHalf />,
    max_wind_speed_kmh: <FaWind />,
    date: <FaCalendarAlt />,
    time: <FaClock />,
    location: <FaGlobe />,
    tornado: <WiTornado />,
    tsunami: <WiTsunami />,
    volcano: <WiVolcano />,
    // Додаємо іконку для довжини, якщо її немає. Можна використати FaRuler або щось подібне, якщо є.
    // Поки що не додаємо, щоб уникнути зайвих імпортів, але майте на увазі.
    length_km: <FaWind /> // Можна використати FaWind або іншу іконку, якщо немає більш підходящої.
};

const formatDetailKey = (key) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

function DisasterDetails({ disaster, onSelectDisaster }) {
    if (!disaster) {
        return <p className="no-details-message">Select an event to see details.</p>;
    }

    const displayLocation = disaster.location
        ? disaster.location
        : (disaster.latitude && disaster.longitude
            ? `${disaster.latitude.toFixed(4)}, ${disaster.longitude.toFixed(4)}`
            : 'N/A');

    const basicDetails = [
        { key: 'Type', value: disaster.type, icon: detailIcons.type || 'ℹ️' },
        { key: 'Severity', value: disaster.severity, icon: detailIcons.magnitude || '📊' },
        { key: 'Location', value: displayLocation, icon: detailIcons.location },
        { key: 'Date', value: disaster.createdAt ? new Date(disaster.createdAt).toLocaleDateString() : 'N/A', icon: detailIcons.date },
        { key: 'Time', value: disaster.createdAt ? new Date(disaster.createdAt).toLocaleTimeString() : 'N/A', icon: detailIcons.time },
    ];

    // Додаємо специфічні метрики в залежності від типу лиха
    const specificMetrics = [];

    if (disaster.type === 'Tornado' && disaster.details && disaster.details.length_km !== undefined) {
        specificMetrics.push({
            key: 'length_km',
            label: 'Length', // Або "Довжина"
            value: `${disaster.details.length_km} km`,
            icon: detailIcons.length_km
        });
    }

    // Інші метрики з disaster.details, які не є length_km (щоб уникнути дублювання, якщо ви їх вже оброблюєте окремо)
    const otherDetails = disaster.details ? Object.entries(disaster.details).filter(([key]) => key !== 'length_km') : [];


    return (
        <div className="disaster-details-content">
            <div className="details-list">
                {basicDetails.map(item => (
                    <div className="detail-item" key={item.key}>
                        <span className="detail-icon">{item.icon}</span>
                        <span className="detail-key">{item.key}:</span>
                        <span className="detail-value">{item.value ?? 'N/A'}</span>
                    </div>
                ))}

                {/* Відображення специфічних метрик, таких як довжина для торнадо */}
                {specificMetrics.length > 0 && (
                    <>
                        <h4 className="details-subheader">Specific Metrics</h4>
                        {specificMetrics.map(item => (
                            <div className="detail-item" key={item.key}>
                                <span className="detail-icon">{item.icon || '📊'}</span>
                                <span className="detail-key">{item.label || formatDetailKey(item.key)}:</span>
                                <span className="detail-value">{item.value ?? 'N/A'}</span>
                            </div>
                        ))}
                    </>
                )}

                {/* Відображення інших метрик з disaster.details */}
                {otherDetails.length > 0 && (
                    <>
                        {specificMetrics.length === 0 && <h4 className="details-subheader">Specific Metrics</h4>} {/* Заголовок, якщо ще не було */}
                        {otherDetails.map(([key, value]) => (
                            <div className="detail-item" key={key}>
                                <span className="detail-icon">{detailIcons[key] || '📊'}</span>
                                <span className="detail-key">{formatDetailKey(key)}:</span>
                                <span className="detail-value">{value ?? 'N/A'}</span>
                            </div>
                        ))}
                    </>
                )}
            </div>

            <RelatedEvents disaster={disaster} onSelectDisaster={onSelectDisaster} />
            <SensorDataChart disasterId={disaster.id} />
        </div>
    );
}

export default DisasterDetails;