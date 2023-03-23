const { tableSchema } = require('../tablePrefix');

cube(`BB`, {
  sql: `SELECT * FROM ${tableSchema()}.brands`,

  joins: {},

  measures: {
    count: {
      type: `count`
    }
  },

  dimensions: {
    code: {
      sql: `code`,
      type: `string`
    },

    name: {
      sql: `name`,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}.\`createdAt\``,
      type: `time`
    }
  }
});
