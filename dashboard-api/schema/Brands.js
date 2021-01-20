const { tableSchema } = require('../tablePrefix');

cube(`Brands`, {
  sql: `SELECT * FROM ${tableSchema(tableSchema)}__brands`,

  joins: {},

  measures: {
    count: {
      type: `count`,
      drillMembers: [name, userid, createdat]
    }
  },

  dimensions: {
    code: {
      sql: `code`,
      type: `string`
    },

    description: {
      sql: `description`,
      type: `string`
    },

    name: {
      sql: `name`,
      type: `string`
    },

    userid: {
      sql: `${CUBE}."userId"`,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}."createdAt"`,
      type: `time`
    }
  }
});
