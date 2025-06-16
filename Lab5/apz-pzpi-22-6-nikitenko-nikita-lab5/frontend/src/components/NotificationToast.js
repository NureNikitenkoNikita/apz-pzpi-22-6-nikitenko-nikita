import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaWater, FaFire, FaMountain, FaWind } from 'react-icons/fa';
import { WiTsunami, WiVolcano, WiTornado } from 'react-icons/wi'; // Corrected import for Tsunami and Volcano, added Tornado

const getIconForDisaster = (type) => {
    switch(type) {
        case 'Earthquake': return <FaMountain />;
        case 'Flood': return <FaWater />;
        case 'Wildfire': return <FaFire />;
        case 'Hurricane': return <FaWind />;
        case 'Tsunami': return <WiTsunami />;
        case 'Tornado': return <WiTornado />; // Використовуємо WiTornado для торнадо
        case 'Volcanic Eruption': return <WiVolcano />;
        default: return <FaExclamationTriangle />;
    }
}

const NotificationToast = ({ disaster, onDone }) => {
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        if (disaster) {
            setVisible(true);
            setExiting(false);

            const timer = setTimeout(() => {
                setExiting(true);
                // Затримка перед фактичним приховуванням, щоб анімація exiting завершилась
                const hideTimer = setTimeout(() => {
                    setVisible(false);
                    onDone(); // Повідомляємо батьківський компонент, що тост зник
                }, 400); // Час має відповідати тривалості CSS-анімації exiting

                return () => clearTimeout(hideTimer); // Очистка для вкладеного таймера
            }, 5000); // Тост зникає через 5 секунд

            return () => clearTimeout(timer); // Очистка основного таймера при розмонтуванні або зміні disaster
        }
    }, [disaster, onDone]);

    if (!visible) return null;

    return (
        <div className="notification-container">
            <div className={`toast ${exiting ? 'exiting' : ''}`}>
                <span className="toast-icon new-event">{getIconForDisaster(disaster.type)}</span>
                <div>
                    <strong>New Event: {disaster.type}</strong>
                    <p style={{margin: '4px 0 0', fontSize: '0.9em', color: 'var(--text-secondary)'}}>
                        Severity: {disaster.severity} - {new Date(disaster.createdAt).toLocaleTimeString()}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default NotificationToast;