const { tableSchema } = require('../tablePrefix');

cube(`Conversations`, {
  sql: `SELECT * FROM ${tableSchema()}__conversations`,

  joins: {},

  measures: {
    count: {
      type: `count`
    }
  },

  dimensions: {
    integrationName: {
      sql: `${CUBE}."integrationId"`,
      type: `string`
    },

    integrationKind: {
      sql: `${CUBE}."integrationId"`,
      type: `string`
    },

    messagecount: {
      sql: `${CUBE}."messageCount"`,
      type: `string`
    },

    status: {
      sql: `status`,
      type: `string`
    },

    firstRespondedUser: {
      sql: `${CUBE}."firstRespondedUserId"`,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}."createdAt"`,
      type: `time`
    },

    updatedat: {
      sql: `${CUBE}."updatedAt"`,
      type: `time`
    },

    firstrespondeddate: {
      sql: `${CUBE}."firstRespondedDate"`,
      type: `time`
    }
  }
});
