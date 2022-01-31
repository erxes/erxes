export const types = `
  type SmsStatus {
    date: Date
    status: String
  }

  type SmsDelivery {
    _id: String!
    createdAt: Date
    to: String

    # telnyx data
    direction: String
    status: String
    responseData: String
    telnyxId: String
    statusUpdates: [SmsStatus]
    errorMessages: [String]

    # engage only
    engageMessageId: String

    # integrations only
    from: String
    content: String
    requestData: String
    erxesApiId: String
    conversationId: String
    integrationId: String
  }

  type DeliveryList {
    list: [SmsDelivery]
    totalCount: Int
  }
`;

export const queries = `
  smsDeliveries(type: String!, to: String, page: Int, perPage: Int): DeliveryList
`;
