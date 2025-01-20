const pipelinesChanged = `
  subscription tasksPipelinesChanged($_id: String!) {
    tasksPipelinesChanged(_id: $_id) {
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
