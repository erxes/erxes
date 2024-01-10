export const types = `
  type MultierkhetResponse {
    content: JSON
    responseId: String
    userId: String
    sessionCode: String
  }

  type ManySyncHistory {
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
    responseData: JSON
    responseStr: String
    error: String

    content: String
    createdUser: JSON
  }

  type ManyCheckResponse {
    _id: String
    mustBrands: String
    
    isSynced: Boolean
    syncedDate: Date
    syncedBillNumber: String
    syncedCustomer: String
  }

  type multiErkhetRemainder {
    _id: String!
    remainder: Int
    remainders: [JSON]
  }
`;
