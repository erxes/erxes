const savingsContractChanged = `
  subscription savingsContractChanged($_id: String!) {
    savingsContractChanged(_id: $_id) {
      _id
    }
  }
`;

export default {
  savingsContractChanged
};