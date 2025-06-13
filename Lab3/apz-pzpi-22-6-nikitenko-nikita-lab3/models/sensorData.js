'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SensorData extends Model {
    static associate(models) {
      SensorData.belongsTo(models.Disaster, {
        foreignKey: 'disasterId',
        as: 'disaster',
      });
    }
  }
  SensorData.init({
    type: DataTypes.STRING,
    value: DataTypes.FLOAT,
    unit: DataTypes.STRING,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    disasterId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Disasters',
        key: 'id'
      }
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'SensorData',
  });
  return SensorData;
};