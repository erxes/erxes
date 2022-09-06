const { tableSchema } = require('../tablePrefix');

cube(`Customers`, {
  sql: `SELECT * FROM ${tableSchema()}.customers`,

  joins: {
    Integrations: {
      relationship: `belongsTo`,
      sql: `${Customers}.integrationId = ${Integrations}._id`
    }
  },

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

    integrationName: {
      sql: `${Integrations}.\`name\``,
      type: `string`
    },

    integrationKind: {
      sql: `${Integrations}.\`kind\``,
      type: `string`
    },

    createdAt: {
      sql: `${CUBE}.\`createdAt\``,
      type: `time`
    },

    firstName: {
      sql: `firstName`,
      type: `string`
    },

    state: {
      sql: `${CUBE}.\`state\``,
      type: `string`
    }
  }
});
