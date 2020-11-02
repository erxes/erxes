cube(`Customers`, {
  sql: `SELECT * FROM erxes__customers`,

  joins: {},

  measures: {
    count: {
      type: `count`,
    },
  },

  dimensions: {
    firstname: {
      sql: `${CUBE}."firstName"`,
      type: `string`,
    },

    hasauthority: {
      sql: `${CUBE}."hasAuthority"`,
      type: `string`,
    },

    isonline: {
      sql: `${CUBE}."isOnline"`,
      type: `string`,
    },

    lastname: {
      sql: `${CUBE}."lastName"`,
      type: `string`,
    },

    phonevalidationstatus: {
      sql: `${CUBE}."phoneValidationStatus"`,
      type: `string`,
    },

    phones: {
      sql: `phones`,
      type: `string`,
    },

    position: {
      sql: `position`,
      type: `string`,
    },

    primaryemail: {
      sql: `${CUBE}."primaryEmail"`,
      type: `string`,
    },
    sex: {
      sql: `sex`,
      type: `string`,
    },

    profilescore: {
      sql: `${CUBE}."profileScore"`,
      type: `string`,
    },

    state: {
      sql: `state`,
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

    birthdate: {
      sql: `${CUBE}."birthDate"`,
      type: `time`,
    },

    modifiedat: {
      sql: `${CUBE}."modifiedAt"`,
      type: `time`,
    },
  },
});
