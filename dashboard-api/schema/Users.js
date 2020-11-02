// import { tableSchema } from '../tablePrefix';

// cube(`Users`, {
//   sql: `SELECT * FROM ${tableSchema()}__users`,

//   joins: {},

//   measures: {
//     count: {
//       type: `count`,
//       drillMembers: [email, role, username],
//     },
//   },

//   dimensions: {
//     uid: {
//       sql: `${CUBE}.\`uid\``,
//       type: `string`,
//       primaryKey: true,
//     },

//     email: {
//       sql: `email`,
//       type: `string`,
//     },

//     role: {
//       sql: `role`,
//       type: `string`,
//     },

//     username: {
//       sql: `username`,
//       type: `string`,
//     },
//   },
// });
