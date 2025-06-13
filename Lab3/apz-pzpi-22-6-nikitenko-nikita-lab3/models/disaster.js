'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Disaster extends Model {
    static associate(models) {
      Disaster.hasMany(models.SensorData, {
        foreignKey: 'disasterId',
        as: 'sensorReadings',
      });
    }
  }
  Disaster.init({
    type: DataTypes.STRING,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    severity: DataTypes.INTEGER,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active'
    },
    path: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    radius: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Disaster',
  });
  return Disaster;
};