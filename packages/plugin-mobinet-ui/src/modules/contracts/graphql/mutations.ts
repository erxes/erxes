const contractsCreate = `
  mutation mobiContractsCreate($ticketId: String!, $assetId: String!) {
    mobiContractsCreate(ticketId: $ticketId, assetId: $assetId) {
      _id
    }
  }
`;

export default {
  contractsCreate
};
