export const mutations = `
  toCheckSynced(ids: [String]): [CheckResponse]
  toSyncLoans(dealIds: [String], configStageId: String, dateType: String): JSON
`;
