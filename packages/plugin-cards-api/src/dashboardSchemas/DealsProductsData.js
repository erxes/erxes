const { tableSchema } = require('../tablePrefix');

cube(`DealsProductsdata`, {
  sql: `SELECT * FROM ${tableSchema()}.\`deals_productsData\``,

  joins: {
    Products: {
      sql: `${CUBE}.\`productsData.productId\` = ${Products}._id`,
      relationship: `belongsTo`
    }
  },

  measures: {
    productAmountSum: {
      sql: `${CUBE}.\`productsData.amount\``,
      type: `sum`,
      title: `Amount sum`
    },

    count: {
      type: `count`,
      title: `Products data count`
    },

    productAmountAvg: {
      sql: `${CUBE}.\`productsData.amount\``,
      type: `avg`,
      title: `Amount avarage`
    },

    productDiscountSum: {
      sql: `${CUBE}.\`productsData.discount\``,
      type: `sum`,
      title: `Discount sum`
    },

    productQuantity: {
      sql: `${CUBE}.\`productsData.quantity\``,
      type: `sum`,
      title: `Products quantity`
    },

    unitprice: {
      sql: `${Products}.\`unitPrice\``,
      type: `sum`,
      title: `Unit Price sum`
    }
  },

  dimensions: {
    _id: {
      sql: `CONCAT(${CUBE}._id)`,
      type: `string`,
      primaryKey: true
    },

    productsdataProduct: {
      sql: `${Products}.name`,
      type: `string`,
      title: `Name`
    },

    productsdataAmount: {
      sql: `${CUBE}.\`productsData.amount\``,
      type: `string`,
      title: `amount`,
      shown: false
    },

    productsdataAssignuserid: {
      sql: `${CUBE}.\`productsData.assignUserId\``,
      type: `string`,
      title: `Productsdata.assignuserid`,
      shown: false
    },

    productsdataCurrency: {
      sql: `${CUBE}.\`productsData.currency\``,
      type: `string`,
      title: `currency`
    },

    productsdataTickUsed: {
      sql: `${CUBE}.\`productsData.tickUsed\``,
      type: `boolean`,
      title: `Tick used`
    },

    productsdataId: {
      sql: `${CUBE}.\`productsData._id\``,
      type: `string`,
      title: `Productsdata. Id`,
      shown: false
    },

    productsdataUom: {
      sql: `${CUBE}.\`productsData.uom\``,
      type: `string`,
      title: `Productsdata.uom`,
      shown: false
    }
  }
});
