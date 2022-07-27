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

      dimensions: {
        status: {
          sql: `status`,
          type: `string`
        },
        createdat: {
          sql: `Customers.\`createdAt\``,
          type: `time`
        }
      }
    }
  ]
};
