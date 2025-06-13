import React from 'react';
import { FaMapMarkerAlt, FaFire } from 'react-icons/fa';
import './HeatmapToggle.css';

const HeatmapToggle = ({ isHeatmapVisible, setIsHeatmapVisible }) => {
  return (
    <div className="heatmap-toggle-container">
        <label>View Mode:</label>
        <div className="toggle-switch">
            <button 
                className={!isHeatmapVisible ? 'active' : ''}
                onClick={() => setIsHeatmapVisible(false)}
            >
                <FaMapMarkerAlt /> Markers
            </button>
            <button
                className={isHeatmapVisible ? 'active' : ''}
                onClick={() => setIsHeatmapVisible(true)}
            >
                <FaFire /> Heatmap
            </button>
        </div>
    </div>
  );
};

export default HeatmapToggle;