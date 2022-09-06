const { tableSchema } = require('../tablePrefix');

cube(`Conversations`, {
  sql: `SELECT * FROM ${tableSchema()}.conversations`,

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {
    Users: {
      sql: `${CUBE}.firstRespondedUserId = ${Users}._id or ${CUBE}.assignedUserId = ${Users}._id  or ${CUBE}.closedUserId = ${Users}._id or ${CUBE}.userId = ${Users}._id`,
      relationship: `belongsTo`
    },
    Customers: {
      sql: `${CUBE}.customerId = ${Customers}._id`,
      relationship: `belongsTo`
    },
    Integrations: {
      relationship: `belongsTo`,
      sql: `${CUBE}.integrationId = ${Integrations}._id`
    },
    ConversationsTag: {
      sql: `${CUBE}._id = ${ConversationsTag}._id`,
      relationship: `belongsTo`
    }
  },

  measures: {
    count: {
      type: `count`
    },

    messagecount: {
      sql: `${CUBE}.\`messageCount\``,
      type: `sum`
    },

    number: {
      sql: `number`,
      type: `sum`
    },

    avgResponse: {
      sql: `${firstrespondeddate} - ${createdat}`,
      type: `avg`,
      title: `Average response time`
    }
  },

  dimensions: {
    _id: {
      sql: `${CUBE}.\`_id\``,
      type: `string`,
      primaryKey: true
    },

    assignedUser: {
      sql: `${Users}.\`username\``,
      type: `string`
    },

    closeduserid: {
      sql: `${CUBE}.\`closedUserId\``,
      type: `string`,
      shown: false
    },

    closedUserName: {
      type: `string`,
      case: {
        when: [
          {
            sql: `${CUBE.closeduserid} = ${Users._id}`,
            label: { sql: `${Users}.username` }
          }
        ],
        else: {}
      },
      title: `Closed user`
    },

    firstrespondeduserid: {
      sql: `${CUBE}.\`firstRespondedUserId\``,
      type: `string`,
      shown: false
    },

    firstrespondeduserName: {
      type: `string`,
      case: {
        when: [
          {
            sql: `${CUBE.firstrespondeduserid} = ${Users._id}`,
            label: { sql: `${Users}.username` }
          }
        ],
        else: {}
      },
      title: `First responsed user`
    },

    content: {
      sql: `content`,
      type: `string`
    },

    customer: {
      sql: `${Customers}.\`firstName\``,
      type: `string`
    },

    integration: {
      sql: `${Integrations}.\`name\``,
      type: `string`
    },

    operatorstatus: {
      sql: `${CUBE}.\`operatorStatus\``,
      type: `string`
    },

    status: {
      sql: `status`,
      type: `string`
    },

    userid: {
      sql: `${CUBE}.\`userId\``,
      type: `string`,
      shown: false
    },

    userName: {
      type: `string`,
      case: {
        when: [
          {
            sql: `${CUBE.userid} = ${Users._id}`,
            label: { sql: `${Users}.username` }
          }
        ],
        else: {}
      },
      title: `User`
    },

    visitorid: {
      sql: `${CUBE}.\`visitorId\``,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}.\`createdAt\``,
      type: `time`
    },

    updatedat: {
      sql: `${CUBE}.\`updatedAt\``,
      type: `time`
    },

    closedat: {
      sql: `${CUBE}.\`closedAt\``,
      type: `time`
    },

    firstrespondeddate: {
      sql: `${CUBE}.\`firstRespondedDate\``,
      type: `time`
    }
  },

  dataSource: `default`
});
