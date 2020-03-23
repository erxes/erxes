const pipelinesChanged = `
  subscription pipelinesChanged($_id: String!) {
    pipelinesChanged(_id: $_id) {
      _id
    }
  }
`;

export default {
  pipelinesChanged
};
