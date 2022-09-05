cube(`Brands`, {
  sql: `SELECT * FROM erxes.brands`,

  joins: {},

  measures: {
    count: {
      type: `count`
    }
  },

  dimensions: {
    code: {
      sql: `code`,
      type: `string`
    },

    name: {
      sql: `name`,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}.\`createdAt\``,
      type: `time`
    }
  }
});
