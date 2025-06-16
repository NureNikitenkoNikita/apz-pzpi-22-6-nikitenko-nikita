import React, { memo } from 'react';

const StatItem = memo(({ value, label }) => (
    <div className="stat-item">
        <div className="value">{value}</div>
        <div className="label">{label}</div>
    </div>
));

function GlobalStats({ disasters }) {
    // Переконуємось, що disasters є масивом, перш ніж використовувати filter або length
    const safeDisasters = Array.isArray(disasters) ? disasters : [];

    const activeCount = safeDisasters.filter(d => d.status === 'active').length;
    const totalCount = safeDisasters.length;
    
    return (
        <div className="global-stats">
            <h2>Глобальна Статистика</h2>
            <div className="stats-grid">
                <StatItem value={activeCount} label="Активні Події" />
                <StatItem value={totalCount} label="Всього (Зараз)" />
            </div>
        </div>
    );
}

export default memo(GlobalStats); // Мемоізуємо компонент