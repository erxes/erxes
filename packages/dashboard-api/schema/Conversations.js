// cube(`Conversations`, {
//   sql: `SELECT * FROM erxes.conversations`,

//   // joins: {
//   //   Integrations: {
//   //     relationship: `belongsTo`,
//   //     sql: `${Conversations}.integrationId = ${Integrations}.id`
//   //   }
//   // },

//   measures: {
//     count: {
//       type: `count`
//     }
//   },

//   dimensions: {
//     id: {
//       sql: `_id`,
//       type: `number`,
//       primaryKey: true
//     },

//     bookingproductid: {
//       sql: `${CUBE}.\`bookingProductId\``,
//       type: `string`
//     },

//     content: {
//       sql: `content`,
//       type: `string`
//     },

//     // integrationid: {
//     //   sql: `Integrations.name`,
//     //   type: `string`
//     // },

//     operatorstatus: {
//       sql: `${CUBE}.\`operatorStatus\``,
//       type: `string`
//     },

//     status: {
//       sql: `status`,
//       type: `string`
//     },

//     createdat: {
//       sql: `${CUBE}.\`createdAt\``,
//       type: `time`
//     }
//   },

//   dataSource: `default`
// });
