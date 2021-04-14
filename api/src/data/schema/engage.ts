export const types = `
  type EngageMessageSms {
    from: String,
    content: String!
    fromIntegrationId: String
  }

  type EngageMessage {
    _id: String!
    kind: String
    tagIds: [String]
    customerTagIds: [String]
    segmentIds: [String]
    brandIds: [String]
    customerIds: [String]
    title: String
    fromUserId: String
    method: String
    isDraft: Boolean
    isLive: Boolean
    stopDate: Date
    createdAt: Date
    type: String
    messengerReceivedCustomerIds: [String]
    totalCustomersCount: Int
    validCustomersCount: Int

    brand: Brand

    email: JSON
    messenger: JSON
    shortMessage: EngageMessageSms
    createdBy: String

    scheduleDate: EngageScheduleDate
    segments: [Segment]
    customerTags: [Tag]
    brands: [Brand]
    fromUser: User
    getTags: [Tag]
    fromIntegration: Integration
    createdUser: String

    stats: JSON
    logs: JSON
    smsStats: JSON
  }

  type EngageScheduleDate {
    type: String,
    month: String,
    day: String,
    dateTime: Date,
  }

  type DeliveryReport {
    _id: String!,
    customerId: String,
    mailId: String,
    status: String,
    engage: EngageMessage,
    createdAt: Date,
    customerName: String
  }

  type EngageDeliveryReport {
    list: [DeliveryReport]
    totalCount: Int
  }

  type AvgEmailStats {
    avgBouncePercent: Float,
    avgClickPercent: Float,
    avgComplaintPercent: Float,
    avgDeliveryPercent: Float,
    avgOpenPercent: Float,
    avgRejectPercent: Float,
    avgRenderingFailurePercent: Float,
    avgSendPercent: Float,
    total: Float
  }

  input EngageScheduleDateInput {
    type: String,
    month: String,
    day: String,
    dateTime: Date,
  }

  input EngageMessageEmail {
    content: String,
    subject: String!,
    replyTo: String,
    sender: String,
    attachments: [JSON]
    templateId: String
  }

  input EngageMessageMessenger {
    brandId: String!,
    kind: String,
    sentAs: String,
    content: String,
    rules: [InputRule],
  }

  input EngageMessageSmsInput {
    from: String,
    content: String!
    fromIntegrationId: String!
  }
`;

const listParams = `
  kind: String
  status: String
  tag: String
  ids: String
  page: Int
  perPage: Int
`;

export const queries = `
  engageMessages(${listParams}): [EngageMessage]
  engageMessagesTotalCount(${listParams}): Int
  engageMessageDetail(_id: String): EngageMessage
  engageMessageCounts(name: String!, kind: String, status: String): JSON
  engagesConfigDetail: JSON
  engageVerifiedEmails: [String]
  engageReportsList(page: Int, perPage: Int, customerId: String, status: String): EngageDeliveryReport
  engageEmailPercentages: AvgEmailStats
`;

const commonParams = `
  title: String!,
  kind: String!,
  method: String!,
  fromUserId: String,
  isDraft: Boolean,
  isLive: Boolean,
  stopDate: Date,
  scheduleDate: Date,
  type: String
  segmentIds: [String],
  customerTagIds: [String],
  brandIds: [String],
  customerIds: [String],
  email: EngageMessageEmail,
  scheduleDate: EngageScheduleDateInput,
  messenger: EngageMessageMessenger,
  shortMessage: EngageMessageSmsInput
`;

export const mutations = `
  engageMessageAdd(${commonParams}): EngageMessage
  engageMessageEdit(_id: String!, ${commonParams}): EngageMessage
  engageMessageRemove(_id: String!): EngageMessage
  engageMessageSetLive(_id: String!): EngageMessage
  engageMessageSetPause(_id: String!): EngageMessage
  engageMessageSetLiveManual(_id: String!): EngageMessage
  engagesUpdateConfigs(configsMap: JSON!): JSON
  engageMessageVerifyEmail(email: String!): String
  engageMessageRemoveVerifiedEmail(email: String!): String
  engageMessageSendTestEmail(from: String!, to: String!, content: String!, title: String!): String
  engageMessageCopy(_id: String!): EngageMessage
`;
