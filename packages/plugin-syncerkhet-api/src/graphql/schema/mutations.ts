export const types = `
  type CheckResponse {
    dealId: String
    isSynced: Boolean
    syncedDate: Date
    syncedBillNumber: String
  }
`;

export const mutations = `
  toCheckSynced(ids: [String]): [CheckResponse]
  toSyncDeals(dealIds: [String]): JSON
`;
