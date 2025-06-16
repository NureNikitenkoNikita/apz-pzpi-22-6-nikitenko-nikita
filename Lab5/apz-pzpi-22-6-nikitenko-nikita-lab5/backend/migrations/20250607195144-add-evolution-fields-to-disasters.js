'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Disasters', 'status', {
      type: Sequelize.STRING,
      defaultValue: 'active' // active, ended
    });
    await queryInterface.addColumn('Disasters', 'path', {
      type: Sequelize.JSONB, // Для зберігання масиву координат
      defaultValue: []
    });
    await queryInterface.addColumn('Disasters', 'radius', {
      type: Sequelize.FLOAT, // Для радіусу пожеж
      defaultValue: 0
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Disasters', 'status');
    await queryInterface.removeColumn('Disasters', 'path');
    await queryInterface.removeColumn('Disasters', 'radius');
  }
};