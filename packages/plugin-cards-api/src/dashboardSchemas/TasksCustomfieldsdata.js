const { tableSchema } = require('../tablePrefix');

cube(`TasksCustomfieldsdata`, {
  sql: `SELECT * FROM ${tableSchema()}.\`tasks_customFieldsData\``,

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

    customfieldsdataNumbervalue: {
      sql: `${CUBE}.\`customFieldsData.numberValue\``,
      type: `string`,
      title: `Customfieldsdata.numbervalue`,
      shown: false
    },

    customfieldsdataStringvalue: {
      sql: `${CUBE}.\`customFieldsData.stringValue\``,
      type: `string`,
      title: `Customfieldsdata.stringvalue`,
      shown: false
    }
  },

  dataSource: `default`
});
