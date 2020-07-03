const tasksChanged = `
  subscription tasksChanged($_id: String!) {
    tasksChanged(_id: $_id) {
      _id
    }
  }
`;

export default {
  tasksChanged
};
