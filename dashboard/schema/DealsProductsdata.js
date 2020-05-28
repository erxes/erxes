import { tableSchema } from '../tablePrefix';

cube(`DealsProductsdata`, {
  sql: `SELECT * FROM ${tableSchema()}.\`deals_productsData\``,

  joins: {
    Deals: {
      sql: `${CUBE}._id = ${Deals}._id`,
      relationship: `belongsTo`,
    },
    Stages: {
      sql: `${Deals}.stageId = ${Stages}._id`,
      relationship: `belongsTo`,
    },
    Pipelines: {
      sql: `${Stages}.pipelineId = ${Pipelines}._id`,
      relationship: `belongsTo`,
    },
  },

  segments: {
    onlyHaveProductAmount: {
      sql: `${productsdataAmount} != ''`,
      title: `Only have product amount`,
    },
  },

  measures: {
    productsdataAmountSum: {
      sql: `${CUBE}.\`productsData.amount\``,
      type: `sum`,
      title: `Amount sum`,
    },

    productsdataAmountAvg: {
      sql: `${CUBE}.\`productsData.amount\``,
      type: `avg`,
      title: `Amount avarage`,
    },

    productsdataDiscountSum: {
      sql: `${CUBE}.\`productsData.discount\``,
      type: `sum`,
      title: `Discount sum`,
    },
  },

  dimensions: {
    _id: {
      sql: `CONCAT(${CUBE}._id)`,
      type: `string`,
      primaryKey: true,
    },

    productsdataProductid: {
      sql: `${CUBE}.\`productsData.productId\``,
      type: `string`,
      title: `Productsdata.productid`,
      shown: false,
    },

    productsdataAmount: {
      sql: `${CUBE}.\`productsData.amount\``,
      type: `string`,
      title: `Productsdata.amount`,
      shown: false,
    },

    productsdataAssignuserid: {
      sql: `${CUBE}.\`productsData.assignUserId\``,
      type: `string`,
      title: `Productsdata.assignuserid`,
      shown: false,
    },

    productsdataCurrency: {
      sql: `${CUBE}.\`productsData.currency\``,
      type: `string`,
      title: `currency`,
    },

    productsdataId: {
      sql: `${CUBE}.\`productsData._id\``,
      type: `string`,
      title: `Productsdata. Id`,
      shown: false,
    },

    productsdataUom: {
      sql: `${CUBE}.\`productsData.uom\``,
      type: `string`,
      title: `Productsdata.uom`,
      shown: false,
    },
  },
});
