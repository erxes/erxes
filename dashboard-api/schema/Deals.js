cube(`ErxesDeals`, {
  sql: `SELECT * FROM erxes__deals`,

  joins: {},

  measures: {
    count: {
      type: `count`,
      drillMembers: [
        assigneduserids,
        companyids,
        customerids,
        initialstageid,
        labelids,
        name,
        stageid,
        userid,
        watcheduserids,
        createdat,
        closedate
      ]
    }
  },

  dimensions: {
    assigneduserids: {
      sql: `${CUBE}."assignedUserIds"`,
      type: `string`
    },

    companyids: {
      sql: `${CUBE}."companyIds"`,
      type: `string`
    },

    customerids: {
      sql: `${CUBE}."customerIds"`,
      type: `string`
    },

    description: {
      sql: `description`,
      type: `string`
    },

    initialstageid: {
      sql: `${CUBE}."initialStageId"`,
      type: `string`
    },

    iscomplete: {
      sql: `${CUBE}."isComplete"`,
      type: `string`
    },

    labelids: {
      sql: `${CUBE}."labelIds"`,
      type: `string`
    },

    modifiedby: {
      sql: `${CUBE}."modifiedBy"`,
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

    priority: {
      sql: `priority`,
      type: `string`
    },

    reminderminute: {
      sql: `${CUBE}."reminderMinute"`,
      type: `string`
    },

    searchtext: {
      sql: `${CUBE}."searchText"`,
      type: `string`
    },

    stageid: {
      sql: `${CUBE}."stageId"`,
      type: `string`
    },

    status: {
      sql: `status`,
      type: `string`
    },

    userid: {
      sql: `${CUBE}."userId"`,
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

    closedate: {
      sql: `${CUBE}."closeDate"`,
      type: `time`
    },

    modifiedat: {
      sql: `${CUBE}."modifiedAt"`,
      type: `time`
    }
  }
});
