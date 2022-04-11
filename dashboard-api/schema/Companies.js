const { tableSchema } = require('../tablePrefix');

cube(`Companies`, {
  sql: `SELECT * FROM ${tableSchema()}__companies`,

  joins: {},

  measures: {
    count: {
      type: `count`
    }
  },

  dimensions: {
    businessType: {
      sql: `state`,
      type: `string`
    },

    tag: {
      sql: `${CUBE}."tagIds"`,
      type: `string`
    },

    createdDate: {
      sql: `${CUBE}."createdAt"`,
      type: `time`
    },

    modifiedDate: {
      sql: `${CUBE}."modifiedAt"`,
      type: `time`
    }
  }
});
