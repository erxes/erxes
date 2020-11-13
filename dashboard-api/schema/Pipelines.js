const { tableSchema } = require('../tablePrefix');

cube(`Pipelines`, {
  sql: `SELECT * FROM ${tableSchema()}__pipelines`,

  joins: {},

  measures: {
    count: {
      type: `count`,
      drillMembers: [
        boardid,
        excludecheckuserids,
        memberids,
        name,
        templateid,
        userid,
        watcheduserids,
        createdat,
        enddate,
        startdate
      ]
    }
  },

  dimensions: {
    bgcolor: {
      sql: `${CUBE}."bgColor"`,
      type: `string`
    },

    boardid: {
      sql: `${CUBE}."boardId"`,
      type: `string`
    },

    excludecheckuserids: {
      sql: `${CUBE}."excludeCheckUserIds"`,
      type: `string`
    },

    hackscoringtype: {
      sql: `${CUBE}."hackScoringType"`,
      type: `string`
    },

    ischeckuser: {
      sql: `${CUBE}."isCheckUser"`,
      type: `string`
    },

    memberids: {
      sql: `${CUBE}."memberIds"`,
      type: `string`
    },

    metric: {
      sql: `metric`,
      type: `string`
    },

    name: {
      sql: `name`,
      type: `string`
    },

    order: {
      sql: `order`,
      type: `string`
    },

    templateid: {
      sql: `${CUBE}."templateId"`,
      type: `string`
    },

    type: {
      sql: `type`,
      type: `string`
    },

    userid: {
      sql: `${CUBE}."userId"`,
      type: `string`
    },

    visibility: {
      sql: `visibility`,
      type: `string`
    },

    visiblity: {
      sql: `visiblity`,
      type: `string`
    },

    watcheduserids: {
      sql: `${CUBE}."watchedUserIds"`,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}."createdAt"`,
      type: `time`
    },

    enddate: {
      sql: `${CUBE}."endDate"`,
      type: `time`
    },

    startdate: {
      sql: `${CUBE}."startDate"`,
      type: `time`
    }
  }
});
