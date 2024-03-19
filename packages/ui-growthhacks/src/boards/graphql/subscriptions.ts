const growthhacksPipelinesChanged = `
  subscription growthhacksPipelinesChanged($_id: String!) {
    growthhacksPipelinesChanged(_id: $_id) {
      _id
      proccessId
      action
      data
    }
  }
`;

export default {
  growthhacksPipelinesChanged,
};
