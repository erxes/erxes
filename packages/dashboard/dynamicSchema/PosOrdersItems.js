cube(`PosOrdersItems`, {
  sql: `SELECT * FROM erxes.pos_orders_items`,

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {
    Products: {
      sql: `${CUBE}.\`items.productId\` = ${Products}._id`,
      relationship: `belongsTo`
    },

    ProductCategories: {
      relationship: `belongsTo`,
      sql: `${CUBE}.${itemProductCategoryId} = ${ProductCategories}._id`
    }
  },

  measures: {
    count: {
      type: `count`,

    },

    itemsCount: {
      sql: `${CUBE}.\`items.count\``,
      type: `sum`,
      title: `Items.count`
    },

    itemsDiscountamount: {
      sql: `${CUBE}.\`items.discountAmount\``,
      type: `sum`,
      title: `Items.discountamount`
    },

    itemsUnitprice: {
      sql: `${CUBE}.\`items.unitPrice\``,
      type: `sum`,
      title: `Items.unitprice`
    },

    itemsAmount: {
      sql: `${itemsCount} * ${itemsUnitprice}`,
      type: `number`,
    },
  },

  dimensions: {
    _id: {
      sql: `CONCAT(${CUBE}._id)`,
      type: `string`,
      primaryKey: true
    },

    itemsId: {
      sql: `${CUBE}.\`items._id\``,
      type: `string`,
      title: `Items. Id`
    },

    itemsPerCount: {
      sql: `${CUBE}.\`items.count\``,
      type: `number`,
      title: `Items. Per Count`
    },

    itemsUnitprice1: {
      sql: `${CUBE}.\`items.unitPrice\``,
      type: `string`,
      title: `Unit price`
    },

    itemsCreatedat: {
      sql: `${CUBE}.\`items.createdAt\``,
      type: `string`,
      title: `Items.createdat`
    },

    itemsOrderid: {
      sql: `${CUBE}.\`items.orderId\``,
      type: `string`,
      title: `Items.orderid`
    },

    itemProductName: {
      sql: `${Products}.name`,
      type: `string`,
      title: `Product name`
    },

    itemProductCategoryId: {
      sql: `${Products}.categoryId`,
      type: `string`,
      title: `Product name`,
      shown: false
    },

    itemProductCategoryName: {
      sql: `${ProductCategories}.\`name\``,
      type: `string`,
      title: `Product Category name`
    },
  },

  dataSource: `default`
});
