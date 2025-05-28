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

export default {
  sendSaving,
  syncLoanCollateral,
  sendLoanSchedules,
  loanContractActive
};
