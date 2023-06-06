const { tableSchema } = require('../tablePrefix');

cube(`Branches`, {
  sql: `SELECT * FROM ${tableSchema()}.branches`,

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
