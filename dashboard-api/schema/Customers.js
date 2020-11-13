const { tableSchema } = require('../tablePrefix');

cube(`Customers`, {
  sql: `SELECT * FROM ${tableSchema()}__customers`,

  joins: {},

  measures: {
    count: {
      type: `count`
    }
  },

  dimensions: {
    state: {
      sql: `state`,
      type: `string`
    },

    status: {
      sql: `status`,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}."createdAt"`,
      type: `time`
    },

    birthdate: {
      sql: `${CUBE}."birthDate"`,
      type: `time`
    },

    modifiedat: {
      sql: `${CUBE}."modifiedAt"`,
      type: `time`
    }
  }
});
