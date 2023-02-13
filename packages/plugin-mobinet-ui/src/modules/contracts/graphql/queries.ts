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

export default {
  list
};
