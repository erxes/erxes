const { tableSchema } = require('../tablePrefix');

cube(`Contacts`, {
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

    createdDate: {
      sql: `${CUBE}."createdAt"`,
      type: `time`
    },

    birthDate: {
      sql: `${CUBE}."birthDate"`,
      type: `time`
    },

    modifiedDate: {
      sql: `${CUBE}."modifiedAt"`,
      type: `time`
    }
  }
});
