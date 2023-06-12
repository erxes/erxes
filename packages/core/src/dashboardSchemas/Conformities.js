const { tableSchema } = require('../tablePrefix');

cube(`Conformities`, {
  sql: `SELECT * FROM ${tableSchema()}.conformities`,

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {
    Customers: {
      sql: `${CUBE}.relTypeId = ${Customers}._id`,
      relationship: `belongsTo`
    },
    Tasks: {
      sql: `${CUBE}.relTypeId = ${Tasks}._id`,
      relationship: `belongsTo`
    },
    Tickets: {
      sql: `${CUBE}.relTypeId = ${Tickets}._id`,
      relationship: `belongsTo`
    },
    Deals: {
      sql: `${CUBE}.relTypeId = ${Deals}._id`,
      relationship: `belongsTo`
    },
    Purchases: {
      sql: `${CUBE}.relTypeId = ${Purchases}._id`,
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
    },

    reltypecustomer: {
      sql: `${Customers}.\`firstName\``,
      type: `string`,
      title: 'Rel-Type Customer'
    },

    reltypetasks: {
      sql: `${Tasks}.\`name\``,
      type: `string`,
      title: 'Rel-Type Tasks'
    },

    reltypetickets: {
      sql: `${Tickets}.\`name\``,
      type: `string`,
      title: 'Rel-Type Tickets'
    },

    reltypedeals: {
      sql: `${Deals}.\`name\``,
      type: `string`,
      title: 'Rel-Type Deals'
    },

    reltypepurchases: {
      sql: `${Purchases}.\`name\``,
      type: `string`,
      title: 'Rel-Type Purchases'
    }
  },

  dataSource: `default`
});