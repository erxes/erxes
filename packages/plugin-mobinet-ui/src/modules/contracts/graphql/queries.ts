const list = `
    query mobiContracts($customerId: String) {
      mobiContracts(customerId: $customerId) {
        _id
        customerId
        documentId
        building {
          name
        }
      }
    }
`;

const getByTicket = `
    query mobiContractsGetByTicket($ticketId: String!) {
      mobiContractsGetByTicket(ticketId: $ticketId)
    }
`;

export default {
  getByTicket,
  list
};
