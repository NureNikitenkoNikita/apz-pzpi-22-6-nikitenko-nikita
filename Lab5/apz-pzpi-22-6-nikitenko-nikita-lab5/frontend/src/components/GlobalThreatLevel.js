import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const calculateThreat = (disasters) => {
    // Переконуємось, що disasters є масивом, перш ніж використовувати reduce або перевіряти length
    const safeDisasters = Array.isArray(disasters) ? disasters : [];
    if (safeDisasters.length === 0) return { level: 'Низький', score: 0, color: '#3FB950' };

    // Сумуємо серйозність тільки активних подій
    const score = safeDisasters.reduce((acc, d) => acc + (d.status === 'active' ? d.severity : 0), 0);

    // Оновлені пороги для рівнів загрози, щоб краще відповідати еволюції
    if (score > 150) return { level: 'КАТАСТРОФІЧНИЙ', score, color: '#F85149' }; // Використовуємо ACCENT-RED
    if (score > 80) return { level: 'КРИТИЧНИЙ', score, color: '#F85149' };    // Використовуємо ACCENT-RED
    if (score > 40) return { level: 'Високий', score, color: '#DAA520' };     // Використовуємо ACCENT-YELLOW
    if (score > 15) return { level: 'Підвищений', score, color: '#58A6FF' };   // Використовуємо ACCENT-BLUE
    return { level: 'Низький', score, color: '#3FB950' };                      // Використовуємо ACCENT-GREEN
};

const GlobalThreatLevel = ({ disasters }) => {
    const threat = useMemo(() => calculateThreat(disasters), [disasters]);

    // Нормалізація рахунку для шкали прогресу (від 0 до 100)
    // Максимальний можливий рахунок можна визначити емпірично або з бекенду
    // Припустимо, що максимальний рахунок, який ми хочемо відображати, це 200 (трохи більше за "Катастрофічний")
    const maxScoreForGauge = 200; 
    const normalizedScore = Math.min(100, (threat.score / maxScoreForGauge) * 100); // Обмеження до 100%

    return (
        <div className="global-threat-container">
            <h3>Глобальний Рівень Загрози</h3>
            <div className="threat-gauge">
                <motion.div
                    key={threat.level} // Key change to re-trigger animation on level change
                    className="threat-level-text"
                    style={{ color: threat.color }}
                    initial={{ opacity: 0, y: -15 }} // Трохи більший рух при появі
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    {threat.level}
                </motion.div>
                <div className="gauge-bar-background">
                    <motion.div
                        className="gauge-bar-foreground"
                        // Передача кольору для застосування CSS-градієнтів
                        style={{ backgroundColor: threat.color }} /* Буде перекритий градієнтом, але важливий для "trigger" CSS */
                        initial={{ width: '0%' }}
                        animate={{ width: `${normalizedScore}%` }}
                        transition={{ duration: 1.0, ease: "easeOut" }} // Довша та плавнiша анімація
                    />
                </div>
                <div className="threat-score-value" style={{ color: threat.color }}>
                    Рівень Загрози: {threat.score}
                </div>
            </div>
        </div>
    );
};

export default React.memo(GlobalThreatLevel); // Мемоізуємо компонент