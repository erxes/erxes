const pipelinesChanged = `
  subscription ticketsPipelinesChanged($_id: String!) {
    ticketsPipelinesChanged(_id: $_id) {
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
