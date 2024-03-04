export const mutations = `
  toCheckSynced(ids: [String]): [CheckResponse]
  toCheckCustomers(codes: [String]): JSON
  toSyncCustomers(action: String, customers: [JSON]): JSON
  toCheckLoans(codes: [String]): JSON
  toSyncLoans(action: String, loans: [JSON]): JSON
  toCheckSavings(codes: [String]): JSON
  toSyncSavings(action: String, savings: [JSON]): JSON
`;
