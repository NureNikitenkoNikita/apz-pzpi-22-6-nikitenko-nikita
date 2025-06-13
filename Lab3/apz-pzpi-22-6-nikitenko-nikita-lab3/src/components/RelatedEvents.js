import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const RelatedEvents = ({ disaster, onSelectDisaster }) => {
    const [related, setRelated] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!disaster) return;
        setIsLoading(true);
        axios.get(`http://localhost:5000/api/disasters/${disaster.id}/similar`)
            .then(res => {
                setRelated(res.data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch related events", err);
                setIsLoading(false);
            });
    }, [disaster]);

    return (
        <div className="related-events-container">
            <h4>Similar Past Events</h4>
            <div className="related-events-list">
                <AnimatePresence>
                    {isLoading ? (
                        <p>Searching archives...</p>
                    ) : related.length > 0 ? (
                        related.map((event, index) => (
                            <motion.div
                                key={event.id}
                                className="related-event-item"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => onSelectDisaster(event)}
                            >
                                <span className="related-date">{new Date(event.createdAt).toLocaleDateString()}</span>
                                <span className="related-severity">Severity: {event.severity}</span>
                            </motion.div>
                        ))
                    ) : (
                        <p>No similar events found in the archives.</p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RelatedEvents;