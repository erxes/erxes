const { tableSchema } = require('../tablePrefix');

cube(`Customers`, {
  sql: `SELECT * FROM ${tableSchema()}.customers`,

  measures: {
    count: {
      type: `count`
    }
  },

  dimensions: {
    _id: {
      sql: `_id`,
      type: `number`,
      primaryKey: true
    },

    firstName: {
      sql: `firstName`,
      type: `string`
    }
  }
});
