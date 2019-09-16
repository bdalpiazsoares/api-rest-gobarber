'use strict';
// arquivo que vai associar a foto ao usuário 
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      // vai criar uma coluna na tabela USERS com o nome avatar_id
      'users',
      'avatar_id',
      {
        type: Sequelize.INTEGER,
        references: {model: 'files', key: 'id' },
        onUpdate: 'CASCADE', //se um dia for atualizado o user
        onDelete: 'SET NULL', // se um dia for deletar o user ele seta nulo
        allowNull: true,
      }
    )
  },

  down: queryInterface => {
    return queryInterface.removeColumn('users', 'avatar_id');
  }
};
