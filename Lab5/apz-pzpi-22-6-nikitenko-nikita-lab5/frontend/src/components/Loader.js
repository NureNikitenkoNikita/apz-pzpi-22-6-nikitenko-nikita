import React from 'react';
import { motion } from 'framer-motion';
import './Loader.css';

const Loader = () => {
  return (
    <motion.div
      className="loader-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="loader-container">
        <div className="loader-ring"></div>
        <div className="loader-text">SYNCING WITH SATELLITES...</div>
      </div>
    </motion.div>
  );
};

export default Loader;