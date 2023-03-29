const { tableSchema } = require('../tablePrefix');

cube(`Customers`, {
  sql: `SELECT * FROM ${tableSchema()}.customers`,

  joins: {
    Integrations: {
      relationship: `belongsTo`,
      sql: `${Customers}.integrationId = ${Integrations}._id`
    },
    CustomersCustomfieldsdata: {
      sql: `${CUBE}._id = ${CustomersCustomfieldsdata}._id`,
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
      type: `time`,
      title: 'Created Date'
    },

    firstName: {
      sql: `firstName`,
      type: `string`
    },

    customField: {
      sql: `${CustomersCustomfieldsdata.customfieldsdataField}`,
      type: `string`,
      title: 'Fields Name'
    },

    customFieldValue: {
      sql: `${CustomersCustomfieldsdata.customfieldsdataStringvalue}`,
      type: `string`,
      title: 'Field Value'
    },

    state: {
      sql: `${CUBE}.\`state\``,
      type: `string`
    }
  }
});
