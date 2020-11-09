cube(`Stages`, {
  sql: `SELECT * FROM erxes__stages`,

  joins: {},

  measures: {
    count: {
      type: `count`,
      drillMembers: [formid, name, pipelineid, createdat]
    }
  },

  dimensions: {
    formid: {
      sql: `${CUBE}."formId"`,
      type: `string`
    },

    name: {
      sql: `name`,
      type: `string`
    },

    order: {
      sql: `order`,
      type: `string`
    },

    pipelineid: {
      sql: `${CUBE}."pipelineId"`,
      type: `string`
    },

    probability: {
      sql: `probability`,
      type: `string`
    },

    status: {
      sql: `status`,
      type: `string`
    },

    type: {
      sql: `type`,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}."createdAt"`,
      type: `time`
    }
  }
});
