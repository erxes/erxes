export const types = `
  type CheckResponse {
    _id: String
    isSynced: Boolean
    syncedDate: Date
    syncedBillNumber: String
  }
`;

export const mutations = `
  toCheckSynced(ids: [String]): [CheckResponse]
  toSyncDeals(dealIds: [String]): JSON
  toSyncOrders(orderIds: [String]): JSON
`;
