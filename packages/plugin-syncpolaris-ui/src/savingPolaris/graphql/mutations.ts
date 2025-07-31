const sendSaving = `
  mutation sendSaving($data: JSON) {
    sendSaving(data: $data)
  }
`;

const savingActive = `
  mutation savingContractActive($contractNumber: String!) {
    savingContractActive(contractNumber: $contractNumber)
  }
`;

const sendDeposit = `
  mutation sendDepositToPolaris($data: JSON) {
    sendDepositToPolaris(data: $data)
  }
`;

const depositActive = `
  mutation depositContractActive($contractNumber: String!) {
    depositContractActive(contractNumber: $contractNumber)
  }
`;

const syncSavingTransactions = `
  mutation sendSavingAmount($data: JSON) {
    sendSavingAmount(data: $data)
  }
`;

const syncDepositTransactions = `
  mutation sendDepositAmount($data: JSON) {
    sendDepositAmount(data: $data)
  }
`;

export default {
  sendSaving,
  savingActive,
  sendDeposit,
  depositActive,
  syncSavingTransactions,
  syncDepositTransactions
};
