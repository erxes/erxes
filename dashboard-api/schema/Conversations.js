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
    brand: {
      sql: `${CUBE}."integrationId"`,
      type: `string`
    },

    tag: {
      sql: `${CUBE}."tagIds"`,
      type: `string`
    },

    status: {
      sql: `status`,
      type: `string`
    },

    assignedUser: {
      sql: `${CUBE}."assignedUserId"`,
      type: `string`
    },

    integrationName: {
      sql: `${CUBE}."integrationId"`,
      type: `string`
    },

    integrationType: {
      sql: `${CUBE}."integrationId"`,
      type: `string`
    },

    firstRespondedUser: {
      sql: `${CUBE}."firstRespondedUserId"`,
      type: `string`
    },

    createdDate: {
      sql: `${CUBE}."createdAt"`,
      type: `time`
    },

    updatedDate: {
      sql: `${CUBE}."updatedAt"`,
      type: `time`
    },

    closedDate: {
      sql: `${CUBE}."closedAt"`,
      type: `time`
    },

    firstRespondedDate: {
      sql: `${CUBE}."firstRespondedDate"`,
      type: `time`
    }
  }
});
