const { tableSchema } = require('../tablePrefix');

cube(`TicketsCustomfieldsdata`, {
  sql: `SELECT * FROM ${tableSchema()}.\`tickets_customFieldsData\``,

  joins: {
    Fields: {
      sql: `${CUBE}.\`customFieldsData.field\` = ${Fields}._id`,
      relationship: `belongsTo`
    },

    Customers: {
      sql: `${CUBE}._id = ${Customers}._id`,
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

    customfieldsdataLocationvalueType: {
      sql: `${CUBE}.\`customFieldsData.locationValue.type\``,
      type: `string`,
      title: `Customfieldsdata.locationvalue.type`,
      shown: false
    },

    customfieldsdataValue: {
      sql: `${CUBE}.\`customFieldsData.extraValue\``,
      type: `string`,
      title: `Customfieldsdata.value`,
      shown: false
    }
  },

  dataSource: `default`
});
