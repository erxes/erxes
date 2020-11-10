cube(`Customers`, {
  sql: `SELECT * FROM erxes__customers`,

  joins: {},

  measures: {
    count: {
      type: `count`
    }
  },

  dimensions: {
    state: {
      sql: `state`,
      type: `string`
    },

    status: {
      sql: `status`,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}."createdAt"`,
      type: `time`
    },

    birthdate: {
      sql: `${CUBE}."birthDate"`,
      type: `time`
    },

    modifiedat: {
      sql: `${CUBE}."modifiedAt"`,
      type: `time`
    }
  }
});
