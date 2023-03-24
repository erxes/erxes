const { tableSchema } = require('../tablePrefix');

cube(`Fields`, {
  sql: `SELECT * FROM ${tableSchema()}.form_fields`,

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {},

  measures: {
    count: {
      type: `count`,
      drillMembers: [lastupdateduserid, name]
    }
  },

  dimensions: {
    _id: {
      sql: `_id`,
      type: `number`,
      primaryKey: true
    },

    code: {
      sql: `code`,
      type: `string`
    },

    contenttype: {
      sql: `${CUBE}.\`contentType\``,
      type: `string`
    },

    description: {
      sql: `description`,
      type: `string`
    },

    lastupdateduserid: {
      sql: `${CUBE}.\`lastUpdatedUserId\``,
      type: `string`
    },

    name: {
      sql: `name`,
      type: `string`
    }
  },

  dataSource: `default`
});
