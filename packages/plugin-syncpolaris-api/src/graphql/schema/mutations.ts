export const mutations = `
  toCheckPolaris(type: String): JSON
  toSyncPolaris( items: [JSON],type: String): JSON
  sendSaving(data: JSON): JSON
  savingContractActive(contractNumber: String!): String
  sendSavingAmount(data: JSON): JSON
  
  sendDepositAmount(data: JSON): JSON

  sendContractToPolaris(data: JSON): JSON
  syncLoanCollateral(data: JSON): JSON
  sendLoanSchedules(data: JSON): JSON
  loanContractActive(contractNumber: String!): JSON
  loanGiveTransaction(data: JSON): JSON
  createLoanRepayment(data: JSON): JSON
  closeLoanRepayment(data: JSON): JSON
`;
