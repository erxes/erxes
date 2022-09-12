const { tableSchema } = require('../tablePrefix');

cube(`Customers`, {
  sql: `SELECT * FROM ${tableSchema()}.customers`,

  joins: {
    Integrations: {
      relationship: `belongsTo`,
      sql: `${Customers}.integrationId = ${Integrations}._id`
    },
    CustomersTag: {
      sql: `${CUBE}._id = ${CustomersTag}._id`,
      relationship: `belongsTo`
    }
  },

  measures: {
    count: {
      type: `count`
    }
  },

  dimensions: {
    _id: {
      sql: `CONCAT(${CUBE}._id)`,
      type: `string`,
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
      type: `time`,
      title: 'Created Date'
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
