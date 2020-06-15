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

const itemsDetailChanged = `
  subscription itemsDetailChanged($_id: String!) {
    itemsDetailChanged(_id: $_id) {
      _id
    }
  }
`;

export default {
  pipelinesChanged,
  itemsDetailChanged
};
