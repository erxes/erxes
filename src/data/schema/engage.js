export const types = `
  type EngageMessage {
    _id: String!
    kind: String
    segmentId: String
    customerIds: [String]
    title: String
    fromUserId: String
    method: String
    isDraft: Boolean
    isLive: Boolean
    stopDate: Date
    createdDate: Date
    messengerReceivedCustomerIds: [String]
    tagIds: [String]

    email: JSON
    messenger: JSON
    deliveryReports: JSON

    segment: Segment
    fromUser: User
  }
`;

export const queries = `
  engageMessages(kind: String, status: String, tag: String, ids: [String]): [EngageMessage]
  engageMessageDetail(_id: String): EngageMessage
  engageMessageCounts(name: String!, kind: String, status: String): JSON
  engageMessagesTotalCount: Int
`;
