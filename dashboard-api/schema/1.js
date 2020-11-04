// import { tableSchema } from '../tablePrefix';

// cube(`Conversations`, {
//   sql: `SELECT * FROM ${tableSchema()}__conversations`,

//   joins: {
//     Integrations: {
//       sql: `${CUBE}.integrationId = ${Integrations}.uid`,
//       relationship: `belongsTo`,
//     },

//     // Customers: {
//     //   sql: `${CUBE}.customerId = ${Customers}.uid`,
//     //   relationship: `belongsTo`,
//     // },
//     // Users: {
//     //   sql: `${CUBE}.firstRespondedUserId = ${Users}.uid or ${CUBE}.assigneduserid = ${Users}.uid  or ${CUBE}.closedUserId = ${Users}.uid`,
//     //   relationship: `belongsTo`,
//     // },
//   },

//   measures: {
//     count: {
//       type: `count`,
//       drillMembers: [
//         assigneduserid,
//         closeduserid,
//         customerid,
//         firstrespondeduserid,
//         integrationid,
//         userid,
//         createdat,
//         updatedat,
//       ],
//     },

//     // messagecount: {
//     //   sql: `${CUBE}."messageCount"`,
//     //   type: `sum`,
//     //   title: 'message count',
//     // },
//   },

//   dimensions: {
//     // uid: {
//     //   sql: `uid`,
//     //   type: `string`,
//     //   primaryKey: true,
//     // },
//     assigneduserid: {
//       sql: `${CUBE}."assignedUserId"`,
//       type: `string`,
//       shown: false,
//     },

//     assignedUserName: {
//       type: `string`,
//       case: {
//         when: [{ sql: `${CUBE.assigneduserid} = ${Users.uid}`, label: { sql: `${Users}.username` } }],
//         else: {},
//       },
//       title: `Assigned User`,
//     },

//     closeduserid: {
//       sql: `${CUBE}."closedUserId"`,
//       type: `string`,
//       shown: false,
//     },

//     closedUserName: {
//       type: `string`,
//       case: {
//         when: [{ sql: `${CUBE.closeduserid} = ${Users.uid}`, label: { sql: `${Users}.username` } }],
//         else: {},
//       },
//       title: `Closed User`,
//     },

//     customerid: {
//       sql: `${CUBE}."customerId"`,
//       type: `string`,
//       shown: false,
//     },

//     firstrespondeduserid: {
//       sql: `${CUBE}."firstRespondedUserId"`,
//       type: `string`,
//       shown: false,
//     },

//     firstrespondeduserName: {
//       type: `string`,
//       case: {
//         when: [{ sql: `${CUBE.firstrespondeduserid} = ${Users.uid}`, label: { sql: `${Users}.username` } }],
//         else: {},
//       },
//       title: `First Responsed User`,
//     },

//     integrationid: {
//       sql: `${CUBE}."integrationId"`,
//       type: `string`,
//       shown: false,
//     },

//     integrationKind: {
//       type: `string`,
//       case: {
//         when: [{ sql: `${CUBE}.integrationId != ''`, label: { sql: `${Integrations}.kind` } }],
//         else: { label: 'undefined' },
//       },
//       title: `Integration Kind`,
//     },

//     integrationName: {
//       type: `string`,
//       case: {
//         when: [{ sql: `${CUBE}.integrationId != ''`, label: { sql: `${Integrations}.name` } }],
//         else: {},
//       },
//       title: `Integration Name`,
//     },

//     locationCountryCube: {
//       type: `string`,
//       title: `Location By Country`,
//       case: {
//         when: [{ sql: `${Customers.locationCountry} != ''`, label: { sql: `${Customers.locationCountry}` } }],
//         else: { label: 'not registered' },
//       },
//     },

//     status: {
//       sql: `status`,
//       type: `string`,
//     },

//     userid: {
//       sql: `${CUBE}."userId"`,
//       type: `string`,
//       shown: false,
//     },

//     createdat: {
//       sql: `${CUBE}."createdAt"`,
//       type: `time`,
//       title: 'Created Date',
//     },

//     updatedat: {
//       sql: `${CUBE}."updatedAt"`,
//       type: `time`,
//       title: 'Updated Date',
//     },
//   },
// });
