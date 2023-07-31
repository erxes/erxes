export const types = `
  type CheckResponse {
    _id: String
    isSynced: Boolean
    syncedDate: Date
    syncedBillNumber: String
    syncedCustomer: String
  }

  type erkhetRemainder {
    _id: String!
    remainder: Int
    remainders: [JSON]
  }
`;
