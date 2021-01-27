const { tableSchema } = require('../tablePrefix');

cube(`Deals`, {
  sql: `SELECT * FROM ${tableSchema()}__deals`,

  joins: {},

  measures: {
    count: {
      type: `count`
    }
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

    pipelineName: {
      sql: `${CUBE}."stageId"`,
      type: `string`
    },

    status: {
      sql: `status`,
      type: `string`
    },

    modifiedBy: {
      sql: `${CUBE}."modifiedBy"`,
      type: `string`
    },

    createdDate: {
      sql: `${CUBE}."createdAt"`,
      type: `time`
    },

    closeDate: {
      sql: `${CUBE}."closeDate"`,
      type: `time`
    },

    modifiedDate: {
      sql: `${CUBE}."modifiedAt"`,
      type: `time`
    }
  }
});
