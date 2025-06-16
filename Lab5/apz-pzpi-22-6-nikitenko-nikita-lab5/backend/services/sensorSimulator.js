const { SensorData, Disaster } = require('../models');
const { Op } = require('sequelize');

const highRiskZones = {
    seismic: [
        { name: 'Japan Trench (Oceanic)', lat: [25, 45], lon: [142, 148], isOceanic: true },
        { name: 'California (Continental)', lat: [32, 42], lon: [-124, -114], isOceanic: false },
        { name: 'Italy/Greece (Continental)', lat: [35, 42], lon: [12, 28], isOceanic: false },
    ],
    volcano: [
        { name: 'Mount Etna, Italy', lat: 37.75, lon: 14.99 },
        { name: 'Iceland', lat: 64.8, lon: -18.52 },
        { name: 'Mount St. Helens, USA', lat: 46.2, lon: -122.18 },
    ],
    flood: [
        { name: 'Danube Basin, Europe', lat: [44, 48], lon: [16, 28] },
        { name: 'Mekong Delta, Asia', lat: [8, 11], lon: [104, 107] },
    ],
    wildfire: [
        { name: 'Mediterranean Europe', lat: [37, 42], lon: [-5, 20] },
        { name: 'Siberia, Russia', lat: [50, 60], lon: [90, 120] },
    ],
    tornado: [
        { name: 'Tornado Alley, USA', lat: [30, 40], lon: [-102, -88] },
    ]
};

function getRandomCoordsInBox(box) {
    const lat = Math.random() * (box.lat[1] - box.lat[0]) + box.lat[0];
    const lon = Math.random() * (box.lon[1] - box.lon[0]) + box.lon[0];
    return { latitude: parseFloat(lat.toFixed(4)), longitude: parseFloat(lon.toFixed(4)) };
}

const readingGenerators = {
    seismic: (zone) => {
        const magnitude = 4.0 + Math.random() * 4; // 4.0 to 8.0
        return {
            value: magnitude, unit: 'Richter',
            details: { magnitude: parseFloat(magnitude.toFixed(1)), depth_km: Math.floor(5 + Math.random() * 70), is_oceanic: zone.isOceanic }
        };
    },
    volcano: () => {
        const eruptionHeight = 1000 + Math.random() * 15000; // Ash column height in meters
        return {
            value: eruptionHeight, unit: 'm',
            details: { ash_plume_height_m: Math.floor(eruptionHeight), type: 'Plinian' }
        };
    },
    tornado: () => {
        const windSpeed = 150 + Math.random() * 250;
        return {
            value: windSpeed, unit: 'km/h',
            details: { wind_speed_kmh: Math.floor(windSpeed), scale: `F${Math.floor(Math.random()*6)}` }
        };
    },
    flood: (zone) => ({ value: 2 + Math.random() * 4, unit: 'm', details: { water_level_m: parseFloat((2 + Math.random() * 4).toFixed(1)) } }),
    wildfire: (zone) => ({ value: 60 + Math.random() * 20, unit: 'C', details: { temperature_c: parseFloat((60 + Math.random() * 20).toFixed(1)) } }),
};

let typeIndex = 0;
async function generateData() {
    const typeName = Object.keys(highRiskZones)[typeIndex];
    const zones = highRiskZones[typeName];
    const zone = zones[Math.floor(Math.random() * zones.length)];
    const coords = (typeName === 'volcano') ? { latitude: zone.lat, longitude: zone.lon } : getRandomCoordsInBox(zone);
    const reading = readingGenerators[typeName](zone);

    const dataToCreate = { type: typeName, ...coords, ...reading };
    await SensorData.create(dataToCreate);

    // Логічний ланцюжок: сильний підводний землетрус може викликати цунамі
    if (typeName === 'seismic' && reading.details.is_oceanic && reading.details.magnitude > 7.0) {
        // Затримка перед створенням сенсора цунамі
        setTimeout(async () => {
            console.log(`>>> Triggering potential Tsunami from earthquake ${reading.details.magnitude} mag`);
            const tsunamiReading = { 
                type: 'tsunami', value: 5 + Math.random() * 25, unit: 'm',
                latitude: coords.latitude, longitude: coords.longitude,
                details: { wave_height_m: parseFloat((5 + Math.random() * 25).toFixed(1)), origin_magnitude: reading.details.magnitude }
            };
            await SensorData.create(tsunamiReading);
        }, 10000); // 10 секунд затримки
    }

    typeIndex = (typeIndex + 1) % Object.keys(highRiskZones).length;
}

function startSensorSimulation() {
    setInterval(generateData, 2000); // Кожні 2 секунди
}

module.exports = { startSensorSimulation };