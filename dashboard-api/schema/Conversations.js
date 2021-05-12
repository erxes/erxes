const { tableSchema } = require('../tablePrefix');

cube(`Conversations`, {
  sql: `SELECT * FROM ${tableSchema()}__conversations`,

  joins: {},

  measures: {
    count: {
      type: `count`
    },

    avgResponse: {
      sql: `${numberFirstRespondedDate} - ${numberCreatedAt}`,
      type: `avg`,
      title: `Avarage response time`
    },

    avgClose: {
      sql: `${numberClosedAt} - ${numberCreatedAt}`,
      type: `avg`,
      title: `Avarage resolve time`
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
    },

    numberCreatedAt: {
      sql: `${CUBE}."numberCreatedAt"`,
      type: `number`,
      shown: false
    },

    numberClosedAt: {
      sql: `${CUBE}."numberClosedAt"`,
      type: `number`,
      shown: false
    }
    ,

    numberUpdatedAt: {
      sql: `${CUBE}."numberUpdatedAt"`,
      type: `number`,
      shown: false
    },

    numberFirstRespondedDate: {
      sql: `${CUBE}."numberFirstRespondedDate"`,
      type: `number`,
      shown: false
    }

  }
});


