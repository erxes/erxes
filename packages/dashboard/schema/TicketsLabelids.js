cube(`TicketsLabelids`, {
  sql: `SELECT * FROM erxes.\`tickets_labelIds\``,

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {
    PipelineLabels: {
      sql: `CONCAT(${CUBE}.labelIds)= ${PipelineLabels}._id`,
      relationship: `belongsTo`
    }
  },

  measures: {
    count: {
      type: `count`,
      drillMembers: [labelids]
    }
  },

  dimensions: {
    _id: {
      sql: `CONCAT(${CUBE}._id)`,
      type: `string`,
      primaryKey: true
    },

    labelids: {
      sql: `${PipelineLabels.name}`,
      type: `string`
    }
  },

  dataSource: `default`
});
