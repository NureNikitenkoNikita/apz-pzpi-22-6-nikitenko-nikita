import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const RelatedEvents = ({ disaster, onSelectDisaster }) => {
    const [related, setRelated] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchRelatedEvents = useCallback(async () => {
        if (!disaster || !disaster.id) {
            setRelated([]);
            setIsLoading(false);
            setError('');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/disasters/${disaster.id}/similar`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setRelated(res.data);
            setIsLoading(false);
        } catch (err) {
            console.error("Failed to fetch related events", err);
            setError('Failed to load similar events.');
            setRelated([]);
            setIsLoading(false);
        }
    }, [disaster]); // Залежність тільки від disaster

    useEffect(() => {
        fetchRelatedEvents();
    }, [fetchRelatedEvents]); // Викликаємо при зміні fetchRelatedEvents

    return (
        <div className="related-events-container">
            <h4>Similar Past Events</h4>
            <div className="related-events-list">
                <AnimatePresence mode="wait"> {/* Use mode="wait" to ensure exit animation completes before new components enter */}
                    {isLoading ? (
                        <motion.p
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="loading-message"
                        >
                            Loading similar events...
                        </motion.p>
                    ) : error ? (
                        <motion.p
                            key="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="error-message"
                        >
                            {error}
                        </motion.p>
                    ) : related.length > 0 ? (
                        related.map((event, index) => (
                            <motion.div
                                key={event.id}
                                className="related-event-item"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }} // Reduced delay, added duration
                                onClick={() => onSelectDisaster(event)}
                            >
                                <span className="related-date">{new Date(event.createdAt).toLocaleDateString()}</span>
                                <span className="related-severity">Severity: {event.severity}</span>
                            </motion.div>
                        ))
                    ) : (
                        <motion.p
                            key="no-events"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="no-events-message" // Add a class for styling if needed
                        >
                            No similar events found in the archives.
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default React.memo(RelatedEvents); // Мемоізуємо компонент