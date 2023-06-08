const { tableSchema } = require('../tablePrefix');

cube(`Purchases`, {
  sql: `SELECT * FROM ${tableSchema()}.purchases`,

  joins: {
    Stages: {
      sql: `${CUBE}.stageId = ${Stages}._id`,
      relationship: `belongsTo`
    },
    PurchasesLabel: {
      sql: `${CUBE}._id= ${PurchasesLabel}._id`,
      relationship: `belongsTo`
    },
    PurchasesProductsdata: {
      sql: `${CUBE}._id = ${PurchasesProductsdata}._id`,
      relationship: `belongsTo`
    },
    PurchasesAssigneduser: {
      sql: `${CUBE}._id = ${PurchasesAssigneduser}._id`,
      relationship: `belongsTo`
    },
    Conformities: {
      sql: `${CUBE}._id = ${Conformities}.relTypeId or ${CUBE}._id = ${Conformities}.mainTypeId `,
      relationship: `belongsTo`
    },
    PurchasesCustomfieldsdata: {
      sql: `${CUBE}._id = ${PurchasesCustomfieldsdata}._id`,
      relationship: `belongsTo`
    },
    PurchasesDepartments: {
      sql: `${CUBE}._id = ${PurchasesDepartments}._id`,
      relationship: `belongsTo`
    },
    PurchasesBranches: {
      sql: `${CUBE}._id = ${PurchasesBranches}._id`,
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

    purchaseCustomField: {
      sql: `${PurchasesCustomfieldsdata.customfieldsdataField}`,
      type: `string`,
      title: 'Fields Name'
    },

    purchaseCustomFieldValue: {
      sql: `${PurchasesCustomfieldsdata.customfieldsdataStringvalue}`,
      type: `string`,
      title: 'Field Value'
    },

    stageid: {
      sql: `${CUBE}.\`stageId\``,
      type: `string`,
      shown: false
    },

    departmentId: {
      sql: `${CUBE}.\`departmentId\``,
      type: `string`,
      shown: false
    },

    branchId: {
      sql: `${CUBE}.\`branchId\``,
      type: `string`,
      shown: false
    },

    assetId: {
      sql: `${CUBE}.\`assetId\``,
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
