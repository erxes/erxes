const { tableSchema } = require('../tablePrefix');

cube(`Tags`, {
  sql: `SELECT * FROM ${tableSchema()}.tags`,

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {},

  measures: {
    count: {
      type: `count`,
      drillMembers: [name, parentid, createdat]
    },

    objectcount: {
      sql: `${CUBE}.\`objectCount\``,
      type: `sum`
    }
  },

  dimensions: {
    _id: {
      sql: `${CUBE}.\`_id\``,
      type: `string`,
      primaryKey: true
    },

    colorcode: {
      sql: `${CUBE}.\`colorCode\``,
      type: `string`
    },

    contenttype: {
      sql: `${CUBE}.\`contentType\``,
      type: `string`
    },

    name: {
      sql: `name`,
      type: `string`
    },

    order: {
      sql: `order`,
      type: `string`
    },

    parentid: {
      sql: `${CUBE}.\`parentId\``,
      type: `string`
    },

    type: {
      sql: `type`,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}.\`createdAt\``,
      type: `time`
    }
  },

  dataSource: `default`
});
