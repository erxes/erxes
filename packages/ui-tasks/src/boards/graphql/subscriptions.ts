const taskPipelinesChanged = `
  subscription taskPipelinesChanged($_id: String!) {
    taskPipelinesChanged(_id: $_id) {
      _id
      proccessId
      action
      data
    }
  }
`;

export default {
  taskPipelinesChanged,
};
