cube(`Trips`, {
  sql: `SELECT * FROM erxes.trips`,

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {
    Customers: {
      sql: `${CUBE}.driverId = ${Customers}._id`,
      relationship: `belongsTo`
    },
    Routes: {
      sql: `${CUBE}.routeId = ${Routes}._id`,
      relationship: `belongsTo`
    },
    TripsDeal: {
      sql: `${CUBE}._id = ${TripsDeal}._id`,
      relationship: `belongsTo`
    }
  },

  measures: {
    count: {
      type: `count`,
      drillMembers: [driverid, routeid, createdat, starteddate]
    }
  },

  dimensions: {
    _id: {
      sql: `${CUBE}.\`_id\``,
      type: `string`,
      primaryKey: true
    },

    driverid: {
      sql: `${Customers}.\`firstName\``,
      type: `string`,
      title: 'Drivers'
    },

    routeid: {
      sql: `${Routes}.\`name\``,
      type: `string`,
      title: 'Routes'
    },

    status: {
      sql: `status`,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}.\`createdAt\``,
      type: `time`
    },

    starteddate: {
      sql: `${CUBE}.\`startedDate\``,
      type: `time`,
      title: 'Start Date'
    }
  },

  dataSource: `default`
});
