'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Disasters', 'details', {
      type: Sequelize.JSONB,
      allowNull: true
    });
    await queryInterface.addColumn('SensorData', 'details', {
        type: Sequelize.JSONB,
        allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Disasters', 'details');
    await queryInterface.removeColumn('SensorData', 'details');
  }
};