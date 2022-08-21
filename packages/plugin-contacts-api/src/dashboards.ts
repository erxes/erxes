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
          sql: `Customers.integrationId = Integration.id`
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

        integrationId: {
          sql: `integrationId`,
          type: `string`
        },

        integrationName: {
          sql: '"Integrations"."name"',
          type: 'string'
        },

        createdat: {
          sql: `Customers.\`createdAt\``,
          type: `time`
        }
      }
    },
    {
      title: 'Integrations',

      sql: `SELECT * FROM erxes.integrations`,

      joins: {
        Customers: {
          relationship: `belongsTo`,
          sql: `Integration.id = Customers.integrationId`
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

        name: {
          sql: `name`,
          type: `string`
        }
      }
    }
  ],

  types: ['Customers', 'Integrations']
};
