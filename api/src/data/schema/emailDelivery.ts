export const types = `
  type EmailDelivery {
    _id: String!
    subject: String
    status: String
    body: String
    to: [String]
    cc: [String]
    bcc: [String]
    attachments: [JSON]
    from: String
    kind: String
    userId: String
    customerId: String
    createdAt: Date

    fromUser: User
    fromEmail: String
  }

  type EmailDeliveryList {
    list: [EmailDelivery]
    totalCount: Int
  }
`;

export const queries = `
  emailDeliveryDetail(_id: String): EmailDelivery 
  transactionEmailDeliveries(searchValue: String, page: Int, perPage: Int): EmailDeliveryList
`;
