const loansContractChanged = `
  subscription loansContractChanged($_id: String!) {
    loansContractChanged(_id: $_id) {
      _id
    }
  }
`;

const loansSchedulesChanged = `
  subscription loansSchedulesChanged($contractId: String!) {
    loansSchedulesChanged(contractId: $contractId) {
      _id
    }
  }
`;

export default {
  loansContractChanged,
  loansSchedulesChanged
};
