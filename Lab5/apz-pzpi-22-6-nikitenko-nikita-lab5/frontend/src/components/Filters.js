import React from 'react';
import { FaFire, FaWater, FaMountain, FaWind } from 'react-icons/fa'; // Removed FaBolt
import { WiTornado, WiVolcano, WiTsunami } from 'react-icons/wi';

const disasterTypes = [
    { name: 'Wildfire', icon: <FaFire /> },
    { name: 'Flood', icon: <FaWater /> },
    { name: 'Earthquake', icon: <FaMountain /> },
    { name: 'Hurricane', icon: <FaWind /> },
    { name: 'Tsunami', icon: <WiTsunami /> },
    { name: 'Tornado', icon: <WiTornado /> },
    { name: 'Volcanic Eruption', icon: <WiVolcano /> },
];

function Filters({ activeFilters, setActiveFilters }) {
    const toggleFilter = (type) => {
        const newFilters = { ...activeFilters };
        newFilters[type] = !newFilters[type];
        setActiveFilters(newFilters);
    };

    return (
        <div className="filters">
            <h3>Filter by Type</h3>
            <div className="filter-group">
                {disasterTypes.map(type => (
                    <button
                        key={type.name}
                        className={`filter-button ${activeFilters[type.name] ? 'active' : ''}`}
                        onClick={() => toggleFilter(type.name)}
                    >
                        {type.icon} {type.name}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Filters;