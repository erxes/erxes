const ticketsChanged = `
  subscription ticketsChanged($_id: String!) {
    ticketsChanged(_id: $_id) {
      _id
    }
  }
`;

export default {
  ticketsChanged
};
