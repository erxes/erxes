export const types = `
  type SyncHistoryPolaris {
    _id: String!
    type: String
    contentType: String
    contentId: String
    createdAt: Date
    createdBy: String
    consumeData: JSON
    consumeStr: String
    sendData: JSON
    sendStr: String
    header: String
    responseData: JSON
    responseStr: String
    error: String

    content: String
    createdUser: JSON
  }

  type CheckResponse {
    _id: String
    isSynced: Boolean
    syncedDate: Date
    syncedBillNumber: String
    syncedCustomer: String
  }

  type polarisRemainder {
    _id: String!
    remainder: Int
    remainders: [JSON]
  }
`;
