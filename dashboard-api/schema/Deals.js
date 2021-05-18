const { tableSchema } = require('../tablePrefix');

cube(`Deals`, {
  sql: `SELECT * FROM ${tableSchema()}__deals`,

  joins: {},

  measures: {
    count: {
      type: `count`
    },

    totalAmount: {
      sql: `${amount}`,
      type: `sum`,
      title: `Total amount`
    },

    avgAmount: {
      sql: `${amount}`,
      type: `avg`,
      title: `Avarage amount`
    },
  },

  dimensions: {
    priority: {
      sql: `priority`,
      type: `string`
    },

    stageName: {
      sql: `${CUBE}."stageId"`,
      type: `string`
    },

    stageProbability: {
      sql: `${CUBE}."stageId"`,
      type: `string`
    },

    pipeline: {
      sql: `${CUBE}."stageId"`,
      type: `string`
    },

    assignedUser: {
      sql: `${CUBE}."assignedUserIds"`,
      type: `string`
    },

    board: {
      sql: `${CUBE}."stageId"`,
      type: `string`
    },

    status: {
      sql: `status`,
      type: `string`
    },

    amount: {
      sql: `${CUBE}."amount"`,
      type: `number`,
      shown: false
    },

    modifiedBy: {
      sql: `${CUBE}."modifiedBy"`,
      type: `string`
    },

    createdDate: {
      sql: `${CUBE}."createdAt"`,
      type: `time`
    },

    closedDate: {
      sql: `${CUBE}."closedDate"`,
      type: `time`
    },

    modifiedDate: {
      sql: `${CUBE}."modifiedAt"`,
      type: `time`
    }
  }
});
