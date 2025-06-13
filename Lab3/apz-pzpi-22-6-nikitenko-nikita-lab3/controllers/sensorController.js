const { SensorData } = require('../models');

exports.getAllSensorData = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await SensorData.findAndCountAll({
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']]
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sensor data', error });
  }
};

exports.getSensorDataForDisaster = async (req, res) => {
  try {
    const { disasterId } = req.params;
    const data = await SensorData.findAll({
      where: { disasterId: disasterId },
      order: [['createdAt', 'ASC']]
    });
    if (!data) {
      return res.status(404).json({ message: 'No sensor data found for this disaster' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sensor data', error });
  }
};