export const types = `
  type EmailDelivery {
    _id: String!
    subject: String
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
`;

export const queries = `
  emailDeliveryDetail(_id: String): EmailDelivery 
`;
