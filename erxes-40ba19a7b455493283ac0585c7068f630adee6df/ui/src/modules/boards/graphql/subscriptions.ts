const pipelinesChanged = `
  subscription pipelinesChanged($_id: String!) {
    pipelinesChanged(_id: $_id) {
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
