import { userActionsMap } from '@erxes/api-utils/src/core';

export default {
  schemas: [
    {
      title: 'Customers',
      sql: `SELECT * FROM erxes.customers`,

      measures: {
        count: {
          type: `count`
        }
      },

      Conversations: {
        Customers: {
          relationship: `belongsTo`,
          sql: `Customers.id = Conversations.id`
        }
      },

      dimensions: {
        id: {
          sql: `_id`,
          type: `string`,
          primaryKey: true
        },
        status: {
          sql: `status`,
          type: `string`
        },
        createdat: {
          sql: `Customers.\`createdAt\``,
          type: `time`
        }
      }
    },
    {
      title: 'Conversations',

      sql: `SELECT * FROM erxes.conversations`,

      joins: {
        Customers: {
          relationship: `belongsTo`,
          sql: `Conversations.id = Customers.id`
        }
      },

      measures: {
        count: {
          type: `count`
        }
      },

      dimensions: {
        id: {
          sql: `_id`,
          type: `string`,
          primaryKey: true
        },
        Integration: {
          sql: `integrationId`,
          type: `string`
        },
        createdat: {
          sql: `Conversations.\`createdAt\``,
          type: `time`
        }
      }
    }
  ]
};
