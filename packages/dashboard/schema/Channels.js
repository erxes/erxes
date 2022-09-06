const { tableSchema } = require('../tablePrefix');

cube(`Channels`, {
  sql: `SELECT * FROM ${tableSchema()}.channels`,

  joins: {},

  measures: {
    count: {
      type: `count`,
      drillMembers: [name, userid, createdat]
    },

    conversationcount: {
      sql: `${CUBE}.\`conversationCount\``,
      type: `sum`
    },

    openconversationcount: {
      sql: `${CUBE}.\`openConversationCount\``,
      type: `sum`
    }
  },

  dimensions: {
    description: {
      sql: `description`,
      type: `string`
    },

    name: {
      sql: `name`,
      type: `string`
    },

    userid: {
      sql: `${CUBE}.\`userId\``,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}.\`createdAt\``,
      type: `time`
    }
  }
});
