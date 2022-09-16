const { tableSchema } = require('../tablePrefix');

cube(`Deals`, {
  sql: `SELECT * FROM ${tableSchema()}.deals`,

  joins: {
    Stages: {
      sql: `${CUBE}.stageId = ${Stages}._id`,
      relationship: `belongsTo`
    },
    DealsLabel: {
      sql: `${CUBE}._id= ${DealsLabel}._id`,
      relationship: `belongsTo`
    },
    DealsProductsdata: {
      sql: `${CUBE}._id = ${DealsProductsdata}._id`,
      relationship: `belongsTo`
    },
    DealsAssigneduser: {
      sql: `${CUBE}._id = ${DealsAssigneduser}._id`,
      relationship: `belongsTo`
    },
    Conformities: {
      sql: `${CUBE}._id = ${Conformities}.relTypeId or ${CUBE}._id = ${Conformities}.mainTypeId `,
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

    initialstageid: {
      sql: `${CUBE}.\`initialStageId\``,
      type: `string`,
      shown: false
    },

    name: {
      sql: `name`,
      type: `string`
    },

    reltypecustomer: {
      sql: `${Conformities.reltypecustomer}`,
      type: `string`,
      title: 'Rel-Type Customer'
    },

    stageName: {
      sql: `${Stages}.name`,
      type: `string`,
      title: `Stage Name`
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
      title: `Pipeline Name`
    },

    stageid: {
      sql: `${CUBE}.\`stageId\``,
      type: `string`,
      shown: false
    },

    status: {
      sql: `status`,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}.\`createdAt\``,
      type: `time`,
      title: 'Created Date'
    },

    closedate: {
      sql: `${CUBE}.\`closeDate\``,
      type: `time`,
      title: 'Closed Date'
    },

    modifiedby: {
      sql: `${CUBE}.\`modifiedBy\``,
      type: `string`,
      shown: false
    }
  }
});
