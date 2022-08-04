export const types = `
  type CheckResponse {
    dealId: String
    isSynced: Boolean
  }
`;

export const mutations = `
  toCheckSyncedDeals(dealIds: [String]): [CheckResponse]
  toSyncDeals(dealIds: [String]): JSON
`;
