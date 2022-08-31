cube(`Customers`, {
  sql: `SELECT * FROM erxes.customers`,

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
    }
  }
});
