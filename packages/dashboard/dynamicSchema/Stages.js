const { tableSchema } = require('../tablePrefix');

cube(`Stages`, {
  sql: `SELECT * FROM ${tableSchema()}.stages`,

  joins: {
    Pipelines: {
      sql: `${CUBE}.pipelineId = ${Pipelines}._id`,
      relationship: `belongsTo`
    }
  },

  measures: {
    count: {
      type: `count`,
      drillMembers: [name, pipelineid, createdat]
    }
  },

  dimensions: {
    _id: {
      sql: `${CUBE}.\`_id\``,
      type: `string`,
      primaryKey: true
    },

    name: {
      sql: `${CUBE}.\`name\``,
      type: `string`
    },

    pipelineName: {
      sql: `${Pipelines}.\`name\``,
      type: `string`
    },

    pipelineid: {
      sql: `${CUBE}.\`pipelineId\``,
      type: `string`,
      shown: false
    },

    probability: {
      sql: `probability`,
      type: `string`,
      shown: false
    },

    type: {
      sql: `type`,
      type: `string`,
      shown: false
    },

    createdat: {
      sql: `${CUBE}.\`createdAt\``,
      type: `time`
    }
  }
});
