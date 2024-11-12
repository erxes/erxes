const pipelinesChanged = `
  subscription salesPipelinesChanged($_id: String!) {
    salesPipelinesChanged(_id: $_id) {
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
