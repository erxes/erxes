import { tableSchema } from '../tablePrefix';

cube(`Integrations`, {
  sql: `SELECT * FROM ${tableSchema()}.integrations`,

  joins: {},

  measures: {
    count: {
      type: `count`,
      drillMembers: [name],
    },

    leaddataViewcount: {
      sql: `${CUBE}.\`leadData.viewCount\``,
      type: `sum`,
      title: `Leaddata.viewcount`,
    },
  },

  dimensions: {
    _id: {
      sql: `${CUBE}.\`_id\``,
      type: `string`,
      primaryKey: true,
    },
    kind: {
      sql: `kind`,
      type: `string`,
    },
    name: {
      sql: `name`,
      type: `string`,
    },
  },
});
