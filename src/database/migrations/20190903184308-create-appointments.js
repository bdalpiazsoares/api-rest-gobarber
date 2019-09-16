// TABELA DE AGENDAMENTOS

'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.createTable('appointments', { 
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        date: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        // relacionamento do agendamento com o usuário
        // marca o usuario que ta fazendo o agendamento
        user_id: {
          type: Sequelize.INTEGER,
          references: {model: 'users', key: 'id'},
          onUpdate: 'CASCADE', /* QUANDO UM USER FOR ALTERADO,
          TODOS OS AGENDAMENTOS SERÃO ALTERADOS TAMBÉM */
          onDelete: 'SET NULL', 
          allowNull: true,
        },
        // marca o prestador de serviços que vai atender esse agendamento
        provider_id: {
          type: Sequelize.INTEGER,
          references: {model: 'users', key: 'id'},
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL', 
          allowNull: true,
        },
        // se o agendamento for cancelado vai marcar a data do cancelamento
        canceled_at: {
          type: Sequelize.DATE,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
        }
      });
    },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
