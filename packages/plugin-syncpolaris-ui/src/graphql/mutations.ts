// Settings

const toCheckCustomers = `
  mutation toCheckCustomers($codes: [String]) {
    toCheckCustomers(codes: $codes)
  }
`;

const toSyncCustomers = `
  mutation toSyncCustomers($action: String, $customers: [JSON]) {
    toSyncCustomers(action: $action, customers: $customers)
  }
`;

const toCheckSavings = `
  mutation toCheckSavings($codes: [String]) {
    toCheckSavings(codes: $codes)
  }
`;

const toSyncSavings = `
  mutation toSyncSavings($action: String, $savings: [JSON]) {
    toSyncSavings(action: $action, savings: $savings)
  }
`;

const toCheckLoans = `
  mutation toCheckLoans($codes: [String]) {
    toCheckLoans(codes: $codes)
  }
`;

const toSyncLoans = `
  mutation toSyncLoans($action: String, $loans: [JSON]) {
    toSyncLoans(action: $action, loans: $loans)
  }
`;

export default {
  toCheckCustomers,
  toSyncCustomers,
  toCheckSavings,
  toSyncSavings,
  toCheckLoans,
  toSyncLoans,
};
