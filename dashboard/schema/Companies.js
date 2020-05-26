import { tableSchema } from '../tablePrefix';

cube(`Companies`, {
  sql: `SELECT * FROM ${tableSchema()}.companies`,

  joins: {},

  measures: {
    count: {
      type: `count`,
      drillMembers: [primaryname, createdat],
    },
  },

  dimensions: {
    primaryemail: {
      sql: `${CUBE}.\`primaryEmail\``,
      type: `string`,
    },

    primaryname: {
      sql: `${CUBE}.\`primaryName\``,
      type: `string`,
    },

    primaryphone: {
      sql: `${CUBE}.\`primaryPhone\``,
      type: `string`,
    },

    createdat: {
      sql: `${CUBE}.\`createdAt\``,
      type: `time`,
    },

    modifiedat: {
      sql: `${CUBE}.\`modifiedAt\``,
      type: `time`,
    },
  },
});
