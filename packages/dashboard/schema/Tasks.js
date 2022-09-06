const { tableSchema } = require('../tablePrefix');

cube(`Tasks`, {
  sql: `SELECT * FROM ${tableSchema()}.tasks`,

  joins: {
    Stages: {
      sql: `${CUBE}.stageId = ${Stages}._id`,
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
      type: `string`
    },

    status: {
      sql: `status`,
      type: `string`
    },

    timetrackStartdate: {
      sql: `${CUBE}.\`timeTrack.startDate\``,
      type: `string`,
      title: `Timetrack.startdate`
    },

    timetrackStatus: {
      sql: `${CUBE}.\`timeTrack.status\``,
      type: `string`,
      title: `Timetrack.status`
    },

    userid: {
      sql: `${CUBE}.\`userId\``,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}.\`createdAt\``,
      type: `time`
    },

    closedate: {
      sql: `${CUBE}.\`closeDate\``,
      type: `time`
    },

    modifiedat: {
      sql: `${CUBE}.\`modifiedAt\``,
      type: `time`
    },

    stagechangeddate: {
      sql: `${CUBE}.\`stageChangedDate\``,
      type: `time`
    },

    startdate: {
      sql: `${CUBE}.\`startDate\``,
      type: `time`
    }
  },

  dataSource: `default`
});
