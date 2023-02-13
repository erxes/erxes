const contractsCreate = `
  mutation mobiContractsCreate($ticketId: String!) {
    mobiContractsCreate(ticketId: $ticketId) {
      _id
    }
  }
`;

export default {
  contractsCreate
};
