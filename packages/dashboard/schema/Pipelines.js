const { tableSchema } = require('../tablePrefix');

cube(`Pipelines`, {
  sql: `SELECT * FROM ${tableSchema()}.pipelines`,

  joins: {},

  measures: {
    count: {
      type: `count`,
      drillMembers: [boardid, name, createdat]
    }
  },

  dimensions: {
    _id: {
      sql: `${CUBE}.\`_id\``,
      type: `string`,
      primaryKey: true
    },

    boardid: {
      sql: `${CUBE}.\`boardId\``,
      type: `string`,
      shown: false
    },

    name: {
      sql: `name`,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}.\`createdAt\``,
      type: `time`
    }
  }
});
