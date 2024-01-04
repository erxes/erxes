const { tableSchema } = require('../tablePrefix');

cube(`Users`, {
  sql: `SELECT * FROM ${tableSchema()}.users`,

  joins: {},

  measures: {
    count: {
      type: `count`,
      drillMembers: [email, role, username]
    }
  },

  dimensions: {
    _id: {
      sql: `${CUBE}.\`_id\``,
      type: `string`,
      primaryKey: true
    },

    email: {
      sql: `email`,
      type: `string`
    },

    role: {
      sql: `role`,
      type: `string`
    },

    username: {
      sql: `username`,
      type: `string`
    },

    detailsFullname: {
      sql: `${CUBE}.\`details.fullName\``,
      type: `string`,
      title: `Details.fullname`
    }
  }
});
