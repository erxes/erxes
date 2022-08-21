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

    integName: {
      sql: `${Integrations}.\`name\``,
      type: `string`
    },

    integrationId: {
      sql: `${CUBE}.\`integrationId\``,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}.\`createdAt\``,
      type: `time`
    },

    birthdate: {
      sql: `${CUBE}.\`birthDate\``,
      type: `time`
    },

    lastseenat: {
      sql: `${CUBE}.\`lastSeenAt\``,
      type: `time`
    },

    messengerdataLastseenat: {
      sql: `${CUBE}.\`messengerData.lastSeenAt\``,
      type: `time`,
      title: `Messengerdata.lastseenat`
    },

    modifiedat: {
      sql: `${CUBE}.\`modifiedAt\``,
      type: `time`
    }
  }
});
