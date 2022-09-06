const { tableSchema } = require('../tablePrefix');

cube(`DealsProductsdata`, {
  sql: `SELECT * FROM ${tableSchema()}.\`deals_productsData\``,

  joins: {
    Deals: {
      sql: `${CUBE}._id = ${Deals}._id`,
      relationship: `belongsTo`
    },
    Stages: {
      sql: `${Deals}.stageId = ${Stages}._id`,
      relationship: `belongsTo`
    },
    Pipelines: {
      sql: `${Stages}.pipelineId = ${Pipelines}._id`,
      relationship: `belongsTo`
    },
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

    productAmountAvg: {
      sql: `${CUBE}.\`productsData.amount\``,
      type: `avg`,
      title: `Amount avarage`
    },

    productDiscountSum: {
      sql: `${CUBE}.\`productsData.discount\``,
      type: `sum`,
      title: `Discount sum`
    }
  },

  dimensions: {
    _id: {
      sql: `CONCAT(${CUBE}._id)`,
      type: `string`,
      primaryKey: true
    },
    // .\`productsData.productId\`
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
