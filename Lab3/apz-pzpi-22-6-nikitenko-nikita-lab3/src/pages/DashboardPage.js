import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

import MapComponent from '../components/Map';
import LiveEventFeed from '../components/LiveEventFeed';
import DisasterDetails from '../components/DisasterDetails';
import SensorDataChart from '../components/SensorDataChart';
import GlobalStats from '../components/GlobalStats';
import Filters from '../components/Filters';
import TimeFilter from '../components/TimeFilter';
import HeatmapToggle from '../components/HeatmapToggle';
import Loader from '../components/Loader';
import RelatedEvents from '../components/RelatedEvents'; // Новий компонент

const socket = io('http://localhost:5000');

function DashboardPage() {
    const navigate = useNavigate();
    const [disasters, setDisasters] = useState([]);
    const [selectedDisaster, setSelectedDisaster] = useState(null);
    const [activePeriod, setActivePeriod] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [isHeatmapVisible, setIsHeatmapVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        Wildfire: true, Flood: true, Earthquake: true, Hurricane: true,
        Tsunami: true, Tornado: true, 'Volcanic Eruption': true,
    });
    const mapRef = useRef();

    // Ефект, який керує ВСІМ: завантаженням даних та підпискою на сокети
    useEffect(() => {
        // Крок 1: Очищення та підготовка до завантаження
        setIsLoading(true);
        setDisasters([]); // <-- ОСНОВНЕ ВИПРАВЛЕННЯ: миттєво очищуємо старі дані
        setSelectedDisaster(null);

        // Крок 2: Завантаження даних відповідно до обраного періоду
        axios.get(`http://localhost:5000/api/disasters?period=${activePeriod}`)
            .then(res => {
                setDisasters(res.data);
            })
            .catch(error => {
                console.error('Error fetching historical disasters:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });

        // Крок 3: Налаштування сокетів (тільки для режиму "Live")
        const handleNewDisaster = (newDisaster) => setDisasters(prev => [newDisaster, ...prev]);
        const handleDisasterUpdate = (updatedDisaster) => setDisasters(prev => prev.map(d => d.id === updatedDisaster.id ? updatedDisaster : d));

        if (activePeriod === 'all') {
            socket.on('new-disaster', handleNewDisaster);
            socket.on('disaster-update', handleDisasterUpdate);
        }

        // Крок 4: Функція очищення, яка відписується від сокетів при зміні періоду
        return () => {
            socket.off('new-disaster', handleNewDisaster);
            socket.off('disaster-update', handleDisasterUpdate);
        };
    }, [activePeriod]); // Цей ефект залежить ТІЛЬКИ від обраного періоду часу

    const filteredDisasters = useMemo(() => {
        return disasters.filter(d => activeFilters[d.type]);
    }, [disasters, activeFilters]);

    const handleSelectDisaster = useCallback((disaster) => {
        // Уникаємо "стрибка", якщо панель вже відкрита
        if (selectedDisaster && selectedDisaster.id === disaster.id) return;

        setSelectedDisaster(null); // Спочатку закриваємо стару панель для плавної анімації
        setTimeout(() => {
            setSelectedDisaster(disaster);
            if (mapRef.current) {
                mapRef.current.flyTo([disaster.latitude, disaster.longitude], 7, {
                    animate: true, duration: 1.2
                });
            }
        }, 150);
    }, [selectedDisaster]);
    
    const handleLogout = () => { /* ... */ };

    return (
        <motion.div className="dashboard-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AnimatePresence>{isLoading && <Loader />}</AnimatePresence>
            <header className="app-header"><h1>Disaster Command Center</h1><button onClick={handleLogout}>Logout</button></header>
            <main className="main-content">
                <aside className="sidebar">
                    <GlobalStats disasters={filteredDisasters} />
                    <TimeFilter activePeriod={activePeriod} setActivePeriod={setActivePeriod} />
                    <HeatmapToggle isHeatmapVisible={isHeatmapVisible} setIsHeatmapVisible={setIsHeatmapVisible} />
                    <Filters activeFilters={activeFilters} setActiveFilters={setActiveFilters} />
                    <LiveEventFeed
                        disasters={filteredDisasters}
                        onSelectDisaster={handleSelectDisaster}
                        selectedDisasterId={selectedDisaster?.id}
                        isLoading={isLoading}
                    />
                </aside>
                <div className="map-details-view">
                    <div className="map-container-wrapper">
                        <MapComponent disasters={filteredDisasters} onSelectDisaster={handleSelectDisaster} mapRef={mapRef} isHeatmapVisible={isHeatmapVisible} />
                    </div>
                    <AnimatePresence>
                        {selectedDisaster && (
                            <motion.div className="details-panel" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}>
                                <h2>{selectedDisaster.type} | Severity {selectedDisaster.severity}</h2>
                                <DisasterDetails disaster={selectedDisaster} />
                                <SensorDataChart disasterId={selectedDisaster.id} key={selectedDisaster.id} />
                                <RelatedEvents disaster={selectedDisaster} onSelectDisaster={handleSelectDisaster} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </motion.div>
    );
}

export default DashboardPage;