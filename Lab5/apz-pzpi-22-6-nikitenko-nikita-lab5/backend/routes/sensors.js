const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');

router.get('/', sensorController.getAllSensorData);
router.get('/disaster/:disasterId', sensorController.getSensorDataForDisaster);

module.exports = router;