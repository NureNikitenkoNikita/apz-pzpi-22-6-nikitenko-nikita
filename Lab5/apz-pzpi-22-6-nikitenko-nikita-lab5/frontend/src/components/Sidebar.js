import React from 'react';
import GlobalThreatLevel from './GlobalThreatLevel';
import GlobalStats from './GlobalStats';
import TimeFilter from './TimeFilter';
import HeatmapToggle from './HeatmapToggle';
import Filters from './Filters';
import LiveEventFeed from './LiveEventFeed';
import { motion } from 'framer-motion';

const Sidebar = (props) => {
    // Гарантуємо, що disasters завжди є масивом, навіть якщо DashboardPage якимось чином передасть undefined
    const safeDisasters = Array.isArray(props.disasters) ? props.disasters : [];

    return (
        <motion.aside 
            className="sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
        >
            <GlobalThreatLevel disasters={safeDisasters} />
            <GlobalStats disasters={safeDisasters} />
            <TimeFilter activePeriod={props.activePeriod} setActivePeriod={props.setActivePeriod} />
            <HeatmapToggle isHeatmapVisible={props.isHeatmapVisible} setIsHeatmapVisible={props.setIsHeatmapVisible} />
            <Filters activeFilters={props.activeFilters} setActiveFilters={props.setActiveFilters} />
            <LiveEventFeed 
                disasters={safeDisasters} 
                onSelectDisaster={props.onSelectDisaster}
                selectedDisasterId={props.selectedDisasterId}
            />
        </motion.aside>
    );
};

export default React.memo(Sidebar); // Мемоізуємо компонент