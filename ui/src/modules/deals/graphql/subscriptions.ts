const dealsChanged = `
  subscription dealsChanged($_id: String!) {
    dealsChanged(_id: $_id) {
      _id
    }
  }
`;

export default {
  dealsChanged
};
