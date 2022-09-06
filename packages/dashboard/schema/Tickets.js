const { tableSchema } = require('../tablePrefix');

cube(`Tickets`, {
  sql: `SELECT * FROM ${tableSchema()}.tickets`,

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {
    Stages: {
      sql: `${CUBE}.stageId = ${Stages}._id`,
      relationship: `belongsTo`
    },
    TicketsLabel: {
      sql: `${CUBE}._id = ${TicketsLabel}._id`,
      relationship: `belongsTo`
    },
    TicketsAssigneduser: {
      sql: `${CUBE}._id = ${TicketsAssigneduser}._id`,
      relationship: `belongsTo`
    }
  },

  measures: {
    count: {
      type: `count`
    }
  },

  dimensions: {
    _id: {
      sql: `${CUBE}.\`_id\``,
      type: `string`,
      primaryKey: true
    },

    description: {
      sql: `description`,
      type: `string`
    },

    initialstageid: {
      sql: `${CUBE}.\`initialStageId\``,
      type: `string`
    },

    modifiedby: {
      sql: `${CUBE}.\`modifiedBy\``,
      type: `string`
    },

    name: {
      sql: `name`,
      type: `string`
    },

    stageName: {
      sql: `${Stages}.name`,
      type: `string`,
      title: `Stage name`
    },

    number: {
      sql: `number`,
      type: `string`
    },

    priority: {
      sql: `priority`,
      type: `string`
    },

    searchtext: {
      sql: `${CUBE}.\`searchText\``,
      type: `string`,
      shown: false
    },

    source: {
      sql: `source`,
      type: `string`
    },

    sourceconversationid: {
      sql: `${CUBE}.\`sourceConversationId\``,
      type: `string`
    },

    stageProbability: {
      type: `string`,
      case: {
        when: [
          {
            sql: `${Stages}.probability != ''`,
            label: { sql: `${Stages}.probability` }
          }
        ],
        else: {}
      }
    },

    pipelineName: {
      sql: `${Stages.pipelineName}`,
      type: `string`,
      title: `Pipeline name`
    },

    stageid: {
      sql: `${CUBE}.\`stageId\``,
      type: `string`,
      shown: false
    },

    status: {
      sql: `status`,
      type: `string`,
      shown: false
    },

    createdat: {
      sql: `${CUBE}.\`createdAt\``,
      type: `time`
    }
  },

  dataSource: `default`
});
