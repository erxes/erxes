const sendSaving = `
  mutation sendContractToPolaris($data: JSON) {
    sendContractToPolaris(data: $data)
  }
`;

const syncLoanCollateral = `
  mutation syncLoanCollateral($data: JSON) {
    syncLoanCollateral(data: $data)
  }
`;

const sendLoanSchedules = `
  mutation sendLoanSchedules($data: JSON) {
    sendLoanSchedules(data: $data)
  }
`;

const loanContractActive = `
  mutation loanContractActive($contractNumber: String!) {
    loanContractActive(contractNumber: $contractNumber)
  }
`;

const loanGiveTransaction = `
  mutation loanGiveTransaction($data: JSON) {
    loanGiveTransaction(data: $data)
  }
`;

const closeLoanRepayment = `
  mutation closeLoanRepayment($data: JSON) {
    closeLoanRepayment(data: $data)
  }
`;

export default {
  sendSaving,
  syncLoanCollateral,
  sendLoanSchedules,
  loanContractActive,
  loanGiveTransaction,
  closeLoanRepayment
};
