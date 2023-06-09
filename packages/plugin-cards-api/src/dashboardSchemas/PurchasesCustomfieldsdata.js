const { tableSchema } = require('../tablePrefix');

cube(`PurchasesCustomfieldsdata`, {
  sql: `SELECT * FROM ${tableSchema()}.\`purchases_customFieldsData\``,

  joins: {
    Fields: {
      sql: `${CUBE}.\`customFieldsData.field\` = ${Fields}._id`,
      relationship: `belongsTo`
    }
  },

  measures: {},

  dimensions: {
    _id: {
      sql: `CONCAT(${CUBE}._id)`,
      type: `string`,
      primaryKey: true
    },

    customfieldsdataField: {
      sql: `${Fields}.\`text\``,
      type: `string`,
      title: `Customfieldsdata.field`,
      shown: false
    },

    customfieldsdataStringvalue: {
      sql: `${CUBE}.\`customFieldsData.stringValue\``,
      type: `string`,
      title: `Customfieldsdata.stringvalue`,
      shown: false
    },

    customfieldsdataDatevalue: {
      sql: `${CUBE}.\`customFieldsData.dateValue\``,
      type: `time`,
      title: `Customfieldsdata.datevalue`,
      shown: false
    }
  },

  dataSource: `default`
});
