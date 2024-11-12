const pipelinesChanged = `
  subscription purchasesPipelinesChanged($_id: String!) {
    purchasesPipelinesChanged(_id: $_id) {
      _id
      proccessId
      action
      data
    }
  }
`;

export default {
  pipelinesChanged
};
