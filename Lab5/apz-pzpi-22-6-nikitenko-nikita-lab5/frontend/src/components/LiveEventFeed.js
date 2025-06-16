import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Для потенційних анімацій списку

// Допоміжні функції для стилів та метрик
const getSeverityStyles = (severity) => {
    // Всі кольори тепер тільки для фону значка, текст буде білим за замовчуванням
    if (severity >= 5) return { color: '#F85149', name: 'Критичний' };
    if (severity >= 4) return { color: '#E3B341', name: 'Високий' };
    if (severity >= 3) return { color: '#58A6FF', name: 'Помірний' };
    return { color: '#3FB950', name: 'Низький' };
};

const getPrimaryMetric = (disaster) => {
    if (!disaster.details) return `Серйозність: ${disaster.severity}`;
    switch(disaster.type) {
        case 'Earthquake': return `Маг: ${disaster.details.magnitude}`;
        case 'Hurricane': return `Вітер: ${disaster.details.max_wind_speed_kmh} км/год`;
        case 'Flood': return `Рівень: ${disaster.details.water_level_m} м`;
        case 'Wildfire': return `Темп: ${disaster.details.temperature_c}°C`;
        case 'Tsunami': return `Хвиля: ${disaster.details.max_wave_height_m || 'N/A'} м`; // Додано
        case 'Tornado': return `Довж: ${disaster.details.path_length_km || 'N/A'} км`; // Додано
        case 'Volcanic Eruption': return `Попіл: ${disaster.details.ash_cloud_height_km || 'N/A'} км`; // Додано
        default: return `Серйозність: ${disaster.severity}`;
    }
};

const EventCard = memo(({ disaster, onSelect, isSelected }) => {
    const styles = getSeverityStyles(disaster.severity);

    return (
        <motion.div
            className={`event-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(disaster)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            layout // Для плавної анімації при додаванні/видаленні елементів
        >
            <div className="event-card-header">
                <h3>{disaster.type}</h3>
                <span className="severity-badge" style={{backgroundColor: styles.color}}>
                    {getPrimaryMetric(disaster)}
                </span>
            </div>
            <p className="event-card-time">
                {new Date(disaster.createdAt).toLocaleString()}
            </p>
            {/* Можна додати інші деталі, якщо потрібно */}
        </motion.div>
    );
});

function LiveEventFeed({ disasters, onSelectDisaster, selectedDisasterId }) {
  // Переконуємось, що disasters є масивом, перш ніж використовувати map
  const safeDisasters = Array.isArray(disasters) ? disasters : [];
  return (
    <div className="event-feed">
        <h3>Live Event Feed</h3>
        <AnimatePresence> {/* Використовуємо AnimatePresence для анімацій входу/виходу елементів списку */}
            {safeDisasters.map(disaster => (
                <EventCard 
                    key={disaster.id}
                    disaster={disaster}
                    onSelect={onSelectDisaster}
                    isSelected={selectedDisasterId === disaster.id}
                />
            ))}
        </AnimatePresence>
    </div>
  );
}

export default React.memo(LiveEventFeed); // Мемоізуємо компонент