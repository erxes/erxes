const pipelinesChanged = `
  subscription pipelinesChanged($_id: String!) {
    pipelinesChanged(_id: $_id) {
      userId
      _id
      itemId
      action
      data
    }
  }
`;

export default {
  pipelinesChanged
};
