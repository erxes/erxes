const { tableSchema } = require('../tablePrefix');

cube(`TripsDeal`, {
  sql: `SELECT * FROM ${tableSchema()}.\`trips_dealIds\``,

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {
    Deals: {
      sql: `CONCAT(${CUBE}.dealIds)= ${Deals}._id`,
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
      sql: `CONCAT(${CUBE}._id)`,
      type: `string`,
      primaryKey: true
    },

    dealids: {
      sql: `${Deals}.\`name\``,
      type: `string`,
      title: 'Name'
    }
  },

  dataSource: `default`
});
