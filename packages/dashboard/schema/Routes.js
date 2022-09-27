const { tableSchema } = require('../tablePrefix');

cube(`Routes`, {
  sql: `SELECT * FROM ${tableSchema()}.routes`,

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {},

  measures: {
    count: {
      type: `count`,
      drillMembers: [name]
    }
  },

  dimensions: {
    _id: {
      sql: `${CUBE}.\`_id\``,
      type: `string`,
      primaryKey: true
    },

    code: {
      sql: `code`,
      type: `string`
    },

    name: {
      sql: `name`,
      type: `string`
    }
  },

  dataSource: `default`
});
