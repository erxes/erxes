const { tableSchema } = require('../tablePrefix');

cube(`TicketsBranches`, {
  sql: `SELECT * FROM ${tableSchema()}.\`tickets_branchIds\``,

  joins: {
    Branches: {
      sql: `CONCAT(${CUBE}.branchIds)= ${Branches}._id`,
      relationship: `belongsTo`
    }
  },

  measures: {},

  dimensions: {
    _id: {
      sql: `CONCAT(${CUBE}._id)`,
      type: `string`,
      primaryKey: true
    },

    branchIds: {
      sql: `${Branches}.\`title\``,
      type: `string`,
      title: 'Title'
    }
  },

  dataSource: `default`
});
