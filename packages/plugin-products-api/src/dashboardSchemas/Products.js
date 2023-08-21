const { tableSchema } = require('../tablePrefix');

cube(`Products`, {
  sql: `SELECT * FROM ${tableSchema()}.products`,

  preAggregations: {
    // Pre-Aggregations definitions go here
    // Learn more here: https://cube.dev/docs/caching/pre-aggregations/getting-started
  },

  joins: {
    ProductCategories: {
      relationship: `belongsTo`,
      sql: `${CUBE}.categoryId = ${ProductCategories}._id`
    }
  },

  measures: {
    count: {
      type: `count`
    },

    unitprice: {
      sql: `${CUBE}.\`unitPrice\``,
      type: `sum`
    }
  },

  dimensions: {
    _id: {
      sql: `${CUBE}.\`_id\``,
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

    category: {
      sql: `${ProductCategories}.\`name\``,
      type: `string`
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

    status: {
      sql: `status`,
      type: `string`
    },

    type: {
      sql: `type`,
      type: `string`
    },

    vendorid: {
      sql: `${CUBE}.\`vendorId\``,
      type: `string`
    },

    createdat: {
      sql: `${CUBE}.\`createdAt\``,
      type: `time`
    }
  },

  dataSource: `default`
});
