// import { tableSchema } from '../tablePrefix';

// cube(`Customers`, {
//   sql: `SELECT * FROM ${tableSchema()}.customers`,

//   joins: {
//     Integrations: {
//       sql: `${CUBE}.integrationId = ${Integrations}._id`,
//       relationship: `belongsTo`,
//     },
//   },

//   measures: {
//     count: {
//       type: `count`,
//     },
//   },

//   segments: {
//     onlyRegisteredByIntegrations: {
//       sql: `${CUBE}.integrationId != '' or ${CUBE}.integrationId !=' '`,
//     },
//     haveLeadSatus: {
//       sql: `${CUBE}.leadStatus != '' or !${CUBE}.leadStatus`,
//     },
//   },

//   dimensions: {
//     _id: {
//       sql: `${CUBE}.\`_id\``,
//       type: `string`,
//       primaryKey: true,
//     },

//     integrationName: {
//       title: 'Integration Name',
//       type: `string`,
//       case: {
//         when: [{ sql: `${CUBE}.integrationId != ''`, label: { sql: `${Integrations}.name` } }],
//         else: {},
//       },
//     },

//     integrationKind: {
//       title: 'Integration Kind',
//       type: `string`,
//       case: {
//         when: [{ sql: `${CUBE}.integrationId != ''`, label: { sql: `${Integrations}.kind` } }],
//         else: {},
//       },
//     },

//     emailValidationStatus: {
//       title: 'Email validation status',
//       sql: `${CUBE}.\`emailValidationStatus\``,
//       type: `string`,
//     },

//     phoneValidationStatus: {
//       title: 'Phone Validation Status',
//       sql: `${CUBE}.\`phoneValidationStatus\``,
//       type: `string`,
//     },

//     leadStatus: {
//       type: `string`,
//       title: 'Lead Status',
//       case: {
//         when: [{ sql: `${CUBE}.leadStatus != ''`, label: { sql: `${CUBE}.leadStatus` } }],
//         else: {},
//       },
//     },

//     lifecycleState: {
//       type: `string`,
//       title: 'Lifecycle State',
//       case: {
//         when: [{ sql: `${CUBE}.lifecycleState != ''`, label: { sql: `${CUBE}.lifecycleState` } }],
//         else: {},
//       },
//     },

//     locationCity: {
//       sql: `${CUBE}.\`location.city\``,
//       type: `string`,
//       title: `Location.city`,
//       shown: false,
//     },

//     locationCountry: {
//       sql: `${CUBE}.\`location.country\``,
//       type: `string`,
//       title: `Location.country`,
//       shown: false,
//     },

//     locationCountryCube: {
//       type: `string`,
//       title: `Location Country`,
//       case: {
//         when: [{ sql: `${locationCountry} != ''`, label: { sql: `${locationCountry}` } }],
//         else: { label: 'not registered' },
//       },
//     },

//     locationCityCube: {
//       type: `string`,
//       title: `Location  City`,
//       case: {
//         when: [{ sql: `${locationCity} != ''`, label: { sql: `${locationCity}` } }],
//         else: { label: 'not registered' },
//       },
//     },

//     status: {
//       sql: `status`,
//       type: `string`,
//     },

//     createdat: {
//       sql: `${CUBE}.\`createdAt\``,
//       type: `time`,
//       title: 'Created Date',
//     },

//     modifiedat: {
//       sql: `${CUBE}.\`modifiedAt\``,
//       type: `time`,
//       title: 'Modified Date',
//     },
//   },
// });
