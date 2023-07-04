const { tableSchema } = require('../tablePrefix');

cube(`Accounts`, {
  sql: `SELECT * FROM ${tableSchema()}.accounts`,

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {
    AccountCategories: {
      relationship: `belongsTo`,
      sql: `${CUBE}.categoryId = ${AccountCategories}._id`
    }
  },

  measures: {
    count: {
      type: `count`
    },

    unitprice: {
      sql: `${CUBE}.\`unitPrice\``,
      type: `sum`
    }
  },

  dimensions: {
    _id: {
      sql: `${CUBE}.\`_id\``,
      type: `number`,
      primaryKey: true
    },

    category: {
      sql: `${AccountCategories}.\`name\``,
      type: `string`
    },

    code: {
      sql: `code`,
      type: `string`
    },

    minimiumcount: {
      sql: `${CUBE}.\`minimiumCount\``,
      type: `string`
    },

    name: {
      sql: `name`,
      type: `string`
    },

    accountcount: {
      sql: `${CUBE}.\`accountCount\``,
      type: `string`
    },

    status: {
      sql: `status`,
      type: `string`
    },

    type: {
      sql: `type`,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}.\`createdAt\``,
      type: `time`
    }
  },

  dataSource: `default`
});
