cube(`PosOrders`, {
  sql: `SELECT * FROM erxes.pos_orders`,

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {
    PosOrdersItems: {
      sql: `${CUBE}._id = ${PosOrdersItems}._id`,
      relationship: `belongsTo`
    },
  },

  measures: {
    count: {
      sql: `${CUBE}.\`_id\``,
      type: `count`,
    },

    cardamount: {
      sql: `${CUBE}.\`cardAmount\``,
      type: `sum`
    },

    cashamount: {
      sql: `${CUBE}.\`cashAmount\``,
      type: `sum`
    },

    mobileamount: {
      sql: `${CUBE}.\`mobileAmount\``,
      type: `sum`
    },
    receivableamount: {
      sql: `${CUBE}.\`receivableAmount\``,
      type: `sum`
    },

    totalamount: {
      sql: `${CUBE}.\`totalAmount\``,
      type: `sum`
    },

    pertotalamount: {
      sql: `${CUBE}.\`totalAmount\``,
      type: `number`
    },

  },

  dimensions: {
    _id: {
      sql: `${CUBE}.\`_id\``,
      type: `string`,
      primaryKey: true
    },

    billtype: {
      sql: `${CUBE}.\`billType\``,
      type: `string`
    },

    branchid: {
      sql: `${CUBE}.\`branchId\``,
      type: `string`
    },

    customerid: {
      sql: `${CUBE}.\`customerId\``,
      type: `string`
    },

    deliveryinfo: {
      sql: `${CUBE}.\`deliveryInfo\``,
      type: `string`
    },

    departmentid: {
      sql: `${CUBE}.\`departmentId\``,
      type: `string`
    },

    number: {
      sql: `number`,
      type: `string`
    },

    productName: {
      sql: `${PosOrdersItems.itemProductName}`,
      type: `string`,
      title: 'Product name'
    },

    postoken: {
      sql: `${CUBE}.\`posToken\``,
      type: `string`
    },

    registernumber: {
      sql: `${CUBE}.\`registerNumber\``,
      type: `string`
    },

    status: {
      sql: `status`,
      type: `string`
    },

    syncid: {
      sql: `${CUBE}.\`syncId\``,
      type: `string`
    },

    type: {
      sql: `type`,
      type: `string`
    },

    userid: {
      sql: `${CUBE}.\`userId\``,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}.\`createdAt\``,
      type: `time`
    },

    paiddate: {
      sql: `${CUBE}.\`paidDate\``,
      type: `time`
    }
  },

  dataSource: `default`
});
