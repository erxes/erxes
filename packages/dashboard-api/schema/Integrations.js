// cube(`Integrations`, {
//   sql: `SELECT * FROM erxes.integrations`,

//   joins: {},

//   dimensions: {
//     id: {
//       sql: `_id`,
//       type: `number`,
//       primaryKey: true
//     },

//     name: {
//       sql: `name`,
//       type: `string`
//     },

//     kind: {
//       sql: `kind`,
//       type: `string`
//     },
//     createdat: {
//       sql: `${CUBE}.\`createdAt\``,
//       type: `time`
//     }
//   },

//   dataSource: `default`
// });
