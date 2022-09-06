const { tableSchema } = require('../tablePrefix');

cube(`ProductCategories`, {
  sql: `SELECT * FROM ${tableSchema()}.product_categories`,

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {},

  measures: {
    count: {
      type: `count`,
      drillMembers: [attachmentName, name, parentid, createdat]
    }
  },

  dimensions: {
    _id: {
      sql: `_id`,
      type: `number`,
      primaryKey: true
    },

    attachment: {
      sql: `attachment`,
      type: `string`
    },

    attachmentName: {
      sql: `${CUBE}.\`attachment.name\``,
      type: `string`,
      title: `Attachment.name`
    },

    attachmentType: {
      sql: `${CUBE}.\`attachment.type\``,
      type: `string`,
      title: `Attachment.type`
    },

    attachmentUrl: {
      sql: `${CUBE}.\`attachment.url\``,
      type: `string`,
      title: `Attachment.url`
    },

    code: {
      sql: `code`,
      type: `string`
    },

    description: {
      sql: `description`,
      type: `string`
    },

    name: {
      sql: `name`,
      type: `string`
    },

    order: {
      sql: `order`,
      type: `string`
    },

    parentid: {
      sql: `${CUBE}.\`parentId\``,
      type: `string`
    },

    status: {
      sql: `status`,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}.\`createdAt\``,
      type: `time`
    }
  },

  dataSource: `default`
});
