import React, { useState, useEffect } from 'react';

const getIconForDisaster = (type) => {
    switch(type) {
        case 'Earthquake': return '🌋';
        case 'Flood': return '🌊';
        case 'Wildfire': return '🔥';
        case 'Hurricane': return '🌀';
        default: return '⚡️';
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
                // Wait for animation to finish before calling onDone
                setTimeout(() => {
                    setVisible(false);
                    onDone();
                }, 300);
            }, 5000); // Show for 5 seconds

            return () => clearTimeout(timer);
        }
    }, [disaster, onDone]);

    if (!visible) return null;

    return (
        <div className="notification-container">
            <div className={`toast ${exiting ? 'exiting' : ''}`}>
                <span className="toast-icon">{getIconForDisaster(disaster.type)}</span>
                <div>
                    <strong>New Event: {disaster.type}</strong>
                    <p style={{margin: '4px 0 0', fontSize: '0.9rem'}}>Severity level {disaster.severity} detected.</p>
                </div>
            </div>
        </div>
    );
};

export default NotificationToast;