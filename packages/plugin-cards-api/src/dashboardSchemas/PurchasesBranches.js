const { tableSchema } = require('../tablePrefix');

cube(`PurchasesBranches`, {
  sql: `SELECT * FROM ${tableSchema()}.\`purchases_branchIds\``,

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

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
