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
    type: String
    messengerReceivedCustomerIds: [String]
    tagIds: [String]
    stats: JSON
    brand: Brand

    email: JSON
    messenger: JSON
    deliveryReports: JSON

    scheduleDate: EngageScheduleDate
    segment: Segment
    fromUser: User
    getTags: [Tag]
  }

  type EngageScheduleDate {
    type: String,
    month: String,
    day: String,
    time: Date,
  }

  input EngageScheduleDateInput {
    type: String,
    month: String,
    day: String,
    time: Date,
  }

  input EngageMessageMessengerRule {
    _id : String!,
    kind: String!,
    text: String!,
    condition: String!,
    value: String,
  }

  input EngageMessageEmail {
    templateId: String,
    subject: String!,
    content: String!,
    attachments: [JSON]
  }

  input EngageMessageMessenger {
    brandId: String!,
    kind: String,
    sentAs: String,
    content: String,
    rules: [EngageMessageMessengerRule],
  }
`;

const listParams = `
  kind: String
  status: String
  tag: String
  ids: [String]
  page: Int
  perPage: Int
`;

export const queries = `
  engageMessages(${listParams}): [EngageMessage]
  engageMessagesTotalCount(${listParams}): Int
  engageMessageDetail(_id: String): EngageMessage
  engageMessageCounts(name: String!, kind: String, status: String): JSON
`;

const commonParams = `
  title: String!,
  kind: String!,
  method: String!,
  fromUserId: String!,
  isDraft: Boolean,
  isLive: Boolean,
  stopDate: Date,
  scheduleDate: Date,
  type: String
  segmentId: String,
  customerIds: [String],
  tagIds: [String],
  email: EngageMessageEmail,
  scheduleDate: EngageScheduleDateInput,
  messenger: EngageMessageMessenger,
`;

export const mutations = `
  engageMessageAdd(${commonParams}): EngageMessage
  engageMessageEdit(_id: String!, ${commonParams}): EngageMessage
  engageMessageRemove(_id: String!): EngageMessage
  engageMessageSetLive(_id: String!): EngageMessage
  engageMessageSetPause(_id: String!): EngageMessage
  engageMessageSetLiveManual(_id: String!): EngageMessage
`;
