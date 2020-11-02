// import { tableSchema } from '../tablePrefix';

// cube(`Pipelines`, {
//   sql: `SELECT * FROM ${tableSchema()}__pipelines`,

//   joins: {},

//   measures: {
//     count: {
//       type: `count`,
//       drillMembers: [boardid, name, createdat],
//     },
//   },

//   dimensions: {
//     uid: {
//       sql: `${CUBE}.\`uid\``,
//       type: `string`,
//       primaryKey: true,
//     },

//     boardid: {
//       sql: `${CUBE}.\`boardId\``,
//       type: `string`,
//       shown: false,
//     },

//     name: {
//       sql: `name`,
//       type: `string`,
//     },

//     createdat: {
//       sql: `${CUBE}.\`createdAt\``,
//       type: `time`,
//     },
//   },
// });
