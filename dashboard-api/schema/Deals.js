cube(`Deals`, {
  sql: `SELECT * FROM erxes__deals`,

  joins: {},

  measures: {
    count: {
      type: `count`
    }
  },

  dimensions: {
    iscomplete: {
      sql: `${CUBE}."isComplete"`,
      type: `string`
    },

    modifiedBy: {
      sql: `${CUBE}."modifiedBy"`,
      type: `string`
    },

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

    status: {
      sql: `status`,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}."createdAt"`,
      type: `time`
    },

    closedate: {
      sql: `${CUBE}."closeDate"`,
      type: `time`
    },

    modifiedat: {
      sql: `${CUBE}."modifiedAt"`,
      type: `time`
    }
  }
});
