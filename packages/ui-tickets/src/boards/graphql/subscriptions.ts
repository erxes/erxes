const ticketPipelinesChanged = `
  subscription ticketPipelinesChanged($_id: String!) {
    ticketPipelinesChanged(_id: $_id) {
      _id
      proccessId
      action
      data
    }
  }
`;

export default {
  ticketPipelinesChanged,
};
