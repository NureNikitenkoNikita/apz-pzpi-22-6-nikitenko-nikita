const { Disaster } = require('../models');
const { Op, Sequelize } = require('sequelize');

// Метод для отримання всіх катастроф
exports.getAllDisasters = async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    let whereClause = {};

    if (period !== 'all') {
        const days = parseInt(period.replace('d', ''));
        const date = new Date();
        date.setDate(date.getDate() - days);
        whereClause.createdAt = { [Op.gte]: date };
    }
    
    const disasters = await Disaster.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });
    res.json(disasters);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching disasters', error });
  }
};

// Метод для пошуку схожих подій
exports.getSimilarDisasters = async (req, res) => {
    try {
        const { id } = req.params;
        const originalDisaster = await Disaster.findByPk(id);

        if (!originalDisaster) {
            return res.status(404).json({ message: 'Disaster not found' });
        }

        const { type, latitude, longitude } = originalDisaster;
        const radiusDegrees = 5; // Шукаємо в радіусі ~5 градусів широти/довготи

        const similarDisasters = await Disaster.findAll({
            where: {
                id: { [Op.ne]: id }, // Виключаємо поточну катастрофу
                type: type,
                latitude: {
                    [Op.between]: [latitude - radiusDegrees, latitude + radiusDegrees]
                },
                longitude: {
                    [Op.between]: [longitude - radiusDegrees, longitude + radiusDegrees]
                }
            },
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        res.json(similarDisasters);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching similar disasters', error });
    }
};