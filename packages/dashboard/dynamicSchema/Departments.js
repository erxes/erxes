const { tableSchema } = require('../tablePrefix');

cube(`Departments`, {
  sql: `SELECT * FROM ${tableSchema()}.departments`,

  joins: {},

  measures: {
    count: {
      type: `count`
    }
  },

  dimensions: {
    _id: {
      sql: `${CUBE}.\`_id\``,
      type: `string`,
      primaryKey: true
    },

    title: {
      sql: `title`,
      type: `string`
    }
  }
});
