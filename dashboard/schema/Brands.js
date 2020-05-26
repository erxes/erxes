import { tableSchema } from '../tablePrefix';

cube(`Brands`, {
  sql: `SELECT * FROM ${tableSchema()}.brands`,

  joins: {},

  measures: {
    count: {
      type: `count`,
      drillMembers: [emailconfigId, name, userid, createdat],
    },
  },

  dimensions: {
    code: {
      sql: `code`,
      type: `string`,
    },

    description: {
      sql: `description`,
      type: `string`,
    },

    emailconfigId: {
      sql: `${CUBE}.\`emailConfig._id\``,
      type: `string`,
      title: `Emailconfig. Id`,
    },

    emailconfigTemplate: {
      sql: `${CUBE}.\`emailConfig.template\``,
      type: `string`,
      title: `Emailconfig.template`,
    },

    emailconfigType: {
      sql: `${CUBE}.\`emailConfig.type\``,
      type: `string`,
      title: `Emailconfig.type`,
    },

    name: {
      sql: `name`,
      type: `string`,
    },

    userid: {
      sql: `${CUBE}.\`userId\``,
      type: `string`,
    },

    createdat: {
      sql: `${CUBE}.\`createdAt\``,
      type: `time`,
    },
  },
});
