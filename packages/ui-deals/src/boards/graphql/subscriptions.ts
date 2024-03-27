const dealsPipelinesChanged = `
  subscription dealsPipelinesChanged($_id: String!) {
    dealsPipelinesChanged(_id: $_id) {
      _id
      proccessId
      action
      data
    }
  }
`;

export default {
  dealsPipelinesChanged,
};
