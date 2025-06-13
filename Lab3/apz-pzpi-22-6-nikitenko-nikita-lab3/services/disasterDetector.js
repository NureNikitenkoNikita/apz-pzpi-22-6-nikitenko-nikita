'use strict';
const { Op } = require('sequelize');
const { Disaster, SensorData } = require('../models');

const thresholds = {
  seismic: { value: 5.5, type: 'Earthquake', severity: 3 },
  flood: { value: 3.5, type: 'Flood', severity: 2 },
  wildfire: { value: 70.0, type: 'Wildfire', severity: 4 },
  hurricane: { value: 150.0, type: 'Hurricane', severity: 5 }, // Залишено для сумісності, якщо додасте знову
  volcano: { value: 5000, type: 'Volcanic Eruption', severity: 5 },
  tornado: { value: 200, type: 'Tornado', severity: 4 },
  tsunami: { value: 1, type: 'Tsunami', severity: 5 },
};

async function detectDisasters(io) {
  for (const sensorType in thresholds) {
    const config = thresholds[sensorType];
    const anomalies = await SensorData.findAll({
      where: { type: sensorType, value: { [Op.gt]: config.value }, disasterId: null, createdAt: { [Op.gt]: new Date(new Date() - 10 * 60 * 1000) } },
    });

    for (const anomaly of anomalies) {
      console.log(`Anomaly detected! Creating ${config.type}...`);
      
      const newDisaster = {
        type: config.type,
        latitude: anomaly.latitude,
        longitude: anomaly.longitude,
        severity: config.severity,
        details: anomaly.details,
        path: ['Hurricane', 'Tornado'].includes(config.type) ? [[anomaly.latitude, anomaly.longitude]] : [],
        radius: config.type === 'Wildfire' ? 5000 : (config.type === 'Tsunami' ? 10000 : 0),
      };

      const createdDisaster = await Disaster.create(newDisaster);
      await anomaly.update({ disasterId: createdDisaster.id });
      io.emit('new-disaster', createdDisaster.toJSON());
    }
  }
}

function startDisasterDetection(io) {
  setInterval(() => detectDisasters(io), 6000);
}

module.exports = { startDisasterDetection };