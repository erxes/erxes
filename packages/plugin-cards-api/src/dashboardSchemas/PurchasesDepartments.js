const { tableSchema } = require('../tablePrefix');

cube(`PurchasesDepartments`, {
  sql: `SELECT * FROM ${tableSchema()}.\`purchases_departmentIds\``,

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {
    Departments: {
      sql: `CONCAT(${CUBE}.departmentIds)= ${Departments}._id`,
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

    departmentIds: {
      sql: `${Departments}.\`title\``,
      type: `string`,
      title: 'Title'
    }
  },

  dataSource: `default`
});
