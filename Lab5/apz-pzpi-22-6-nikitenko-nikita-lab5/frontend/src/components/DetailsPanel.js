import React from 'react';
import DisasterDetails from './DisasterDetails';
import { motion } from 'framer-motion';

function DetailsPanel({ disaster, onSelectDisaster }) {
    return (
        <motion.div
            className="details-panel"
            initial={{ x: "100%" }} // Поява справа
            animate={{ x: 0 }}
            exit={{ x: "100%" }} // Зникнення вправо
            transition={{ duration: 0.5, ease: "easeInOut" }}
        >
            <h2>{disaster.type} Details</h2>
            <DisasterDetails disaster={disaster} onSelectDisaster={onSelectDisaster} />
            <button
                className="auth-button close-panel-button"
                onClick={() => onSelectDisaster(null)}
            >
                Close
            </button>
        </motion.div>
    );
}

export default DetailsPanel;