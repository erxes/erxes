const { tableSchema } = require('../tablePrefix');

cube(`PurchasesAssigneduser`, {
  sql: `SELECT * FROM ${tableSchema()}.\`purchases_assignedUserIds\``,

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {
    Users: {
      sql: `CONCAT(${CUBE}.assignedUserIds)= ${Users}._id`,
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

    assigneduserids: {
      sql: `${Users}.\`username\``,
      type: `string`,
      title: 'Name'
    }
  },

  dataSource: `default`
});
