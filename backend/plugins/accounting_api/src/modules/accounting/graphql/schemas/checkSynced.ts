export const types = `
  type AccountingCheckSyncedResponse {
    _id: String!
    isSynced: Boolean
    syncedDate: Date
    syncedBillNumber: String
    syncedCustomer: String
  }

  type AccountingSyncResult {
    skipped: [String]
    error: [String]
    success: [String]
  }
`;

export const queries = ``;

export const mutations = `
  accountingCheckSynced(ids: [String], contentType: String): [AccountingCheckSyncedResponse]
  accountingSyncDeals(dealIds: [String], ruleId: String, dateType: String): AccountingSyncResult
  accountingSyncOrders(orderIds: [String], ruleId: String): AccountingSyncResult
`;
