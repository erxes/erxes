const { tableSchema } = require('../tablePrefix');

cube(`Tasks`, {
  sql: `SELECT * FROM ${tableSchema()}.tasks`,

  joins: {
    Stages: {
      sql: `${CUBE}.stageId = ${Stages}._id`,
      relationship: `belongsTo`
    },
    TasksLabel: {
      sql: `${CUBE}._id= ${TasksLabel}._id`,
      relationship: `belongsTo`
    },
    TasksAssigneduser: {
      sql: `${CUBE}._id = ${TasksAssigneduser}._id`,
      relationship: `belongsTo`
    },
    TasksDepartments: {
      sql: `${CUBE}._id = ${TasksDepartments}._id`,
      relationship: `belongsTo`
    },
    TasksBranches: {
      sql: `${CUBE}._id = ${TasksBranches}._id`,
      relationship: `belongsTo`
    },
    Conformities: {
      sql: `${CUBE}._id = ${Conformities}.relTypeId or ${CUBE}._id = ${Conformities}.mainTypeId `,
      relationship: `belongsTo`
    },
    TasksCustomfieldsdata: {
      sql: `${CUBE}._id = ${TasksCustomfieldsdata}._id`,
      relationship: `belongsTo`
    },
    Users: {
      sql: `CONCAT(${CUBE}.userId)= ${Users}._id`,
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
      type: `string`,
      shown: false
    },

    userid: {
      sql: `
        CASE
          WHEN ${Users}.\`details.fullName\` IS NULL OR ${Users}.\`details.fullName\` = '' THEN ${Users}.\`username\`
          ELSE ${Users}.\`details.fullName\`
        END
      `,
      type: `string`,
      title: `Created User`
    },

    initialstageid: {
      sql: `${CUBE}.\`initialStageId\``,
      type: `string`,
      title: 'Initial Stage',
      shown: false
    },

    modifiedby: {
      sql: `${CUBE}.\`modifiedBy\``,
      type: `string`,
      title: 'Modified User'
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
      title: `Stage name`
    },

    number: {
      sql: `number`,
      type: `string`,
      shown: false
    },

    priority: {
      sql: `priority`,
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

    taskCustomField: {
      sql: `${TasksCustomfieldsdata.customfieldsdataField}`,
      type: `string`,
      title: 'Fields Name'
    },

    taskCustomFieldValue: {
      sql: `${TasksCustomfieldsdata.customfieldsdataStringvalue}`,
      type: `string`,
      title: 'Field Value'
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
      type: `time`,
      title: 'Creted Date'
    },

    modifiedat: {
      sql: `${CUBE}.\`modifiedAt\``,
      type: `time`,
      title: 'Modified Date',
      shown: false
    }
  },

  dataSource: `default`
});
