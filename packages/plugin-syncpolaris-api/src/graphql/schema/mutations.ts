export const mutations = `
  toCheckPolaris(type: String): JSON
  toSyncPolaris( items: [JSON],type: String): JSON
  sendSaving(data: JSON): JSON
  savingContractActive(contractNumber: String!): String

  sendContractToPolaris(data: JSON): JSON
  syncLoanCollateral(data: JSON): JSON
  sendLoanSchedules(data: JSON): JSON
  loanContractActive(contractNumber: String!): JSON
`;
