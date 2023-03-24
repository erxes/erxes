const { tableSchema } = require('../tablePrefix');

cube(`CarConformities`, {
  sql: `SELECT * FROM ${tableSchema()}.conformities`,

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {
    Cars: {
      sql: `${CUBE}.relTypeId = ${Cars}._id`,
      relationship: `belongsTo`
    }
  },

  measures: {
    count: {
      type: `count`
    }
  },

  dimensions: {
    _id: {
      sql: `${CUBE}.\`_id\``,
      type: `string`,
      primaryKey: true
    },

    maintype: {
      sql: `${CUBE}.\`mainType\``,
      type: `string`
    },

    maintypeid: {
      sql: `${CUBE}.\`mainTypeId\``,
      type: `string`
    },

    reltype: {
      sql: `${CUBE}.\`relType\``,
      type: `string`
    },

    reltypename: {
      sql: `${Cars}.\`platenumber\``,
      type: `string`,
      title: 'Rel-Type Car'
    }
  },

  dataSource: `default`
});
