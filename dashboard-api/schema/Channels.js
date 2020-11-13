const { tableSchema } = require('../tablePrefix');

cube(`Channels`, {
  sql: `SELECT * FROM ${tableSchema()}__channels`,

  joins: {},

  measures: {
    count: {
      type: `count`,
      drillMembers: [integrationids, memberids, name, userid, createdat]
    }
  },

  dimensions: {
    conversationcount: {
      sql: `${CUBE}."conversationCount"`,
      type: `string`
    },

    description: {
      sql: `description`,
      type: `string`
    },

    integrationids: {
      sql: `${CUBE}."integrationIds"`,
      type: `string`
    },

    memberids: {
      sql: `${CUBE}."memberIds"`,
      type: `string`
    },

    name: {
      sql: `name`,
      type: `string`
    },

    openconversationcount: {
      sql: `${CUBE}."openConversationCount"`,
      type: `string`
    },

    userid: {
      sql: `${CUBE}."userId"`,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}."createdAt"`,
      type: `time`
    }
  }
});
