cube(`Conversations`, {
  sql: `SELECT * FROM erxes__conversations`,

  joins: {},

  measures: {
    count: {
      type: `count`,
      drillMembers: [customerid, integrationid, readuserids, createdat, updatedat, firstrespondeddate],
    },
  },

  dimensions: {
    content: {
      sql: `content`,
      type: `string`,
    },

    customerid: {
      sql: `${CUBE}."customerId"`,
      type: `string`,
    },

    integrationid: {
      sql: `${CUBE}."integrationId"`,
      type: `string`,
    },

    iscustomerrespondedlast: {
      sql: `${CUBE}."isCustomerRespondedLast"`,
      type: `string`,
    },

    messagecount: {
      sql: `${CUBE}."messageCount"`,
      type: `string`,
    },

    number: {
      sql: `number`,
      type: `string`,
    },

    operatorstatus: {
      sql: `${CUBE}."operatorStatus"`,
      type: `string`,
    },

    readuserids: {
      sql: `${CUBE}."readUserIds"`,
      type: `string`,
    },

    status: {
      sql: `status`,
      type: `string`,
    },

    createdat: {
      sql: `${CUBE}."createdAt"`,
      type: `time`,
    },

    updatedat: {
      sql: `${CUBE}."updatedAt"`,
      type: `time`,
    },

    firstrespondeddate: {
      sql: `${CUBE}."firstRespondedDate"`,
      type: `time`,
    },
  },
});
