const { tableSchema } = require('../tablePrefix');

cube(`Leads`, {
  sql: `SELECT * FROM ${tableSchema()}__customers WHERE state='lead'`,

  joins: {},

  measures: {
    count: {
      type: `count`
    }
  },

  dimensions: {
    brand: {
      sql: `${CUBE}."integrationId"`,
      type: `string`
    },

    status: {
      sql: `status`,
      type: `string`
    },

    tag: {
      sql: `${CUBE}."tagIds"`,
      type: `string`
    },

    country: {
      sql: `${CUBE}."location.country"`,
      type: `string`
    },

    city: {
      sql: `${CUBE}."location.city"`,
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
