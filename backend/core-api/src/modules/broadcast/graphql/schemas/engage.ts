import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type EngageMessage {
    _id: String!
    kind: String
    tagIds: [String]
    customerTagIds: [String]
    segmentIds: [String]
    brandIds: [String]
    customerIds: [String]
    cpId: String
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
    runCount: Int
    lastRunAt: Date

    status: String
    progress: JSON

    brandId: String

    email: JSON
    messenger: JSON
    shortMessage: EngageMessageSms
    notification: JSON
    createdBy: String

    scheduleDate: EngageScheduleDate

    segments: [Segment]
    customerTags: [Tag]
    getTags: [Tag]
    brands: [Brand]
    fromIntegration: JSON

    stats: JSON
  }

  type EngageScheduleDate {
    type: String,
    month: String,
    day: String,
    dateTime: Date,
  }

  type DeliveryReport {
    _id: String!
    customerId: String
    mailId: String
    status: String
    engage: EngageMessage
    createdAt: Date
    customerName: String
    email: String
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
  }

  type EngageMessageSms {
    from: String,
    content: String!
    fromIntegrationId: String
  }

  input InputRule {
    _id : String!,
    kind: String!,
    text: String!,
    condition: String!,
    value: String,
  }

  input EngageMessageMessenger {
    integrationId: String!,
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

  input EngageMessageNotification {
    title: String!,
    content: String!,
    isMobile: Boolean,
    inApp: Boolean
  }

  type EngageMessageListResponse {
    list: [EngageMessage]
    pageInfo: PageInfo
    totalCount: Int
  }

  type EngageMemberListResponse {
    list: [User]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

const queryParams = `
  kind: String
  status: String
  method: String
  brandId: String
  fromUserId: String
  searchValue: String
  
  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  engageMessages(${queryParams}): EngageMessageListResponse
  engageMessagesTotalCount(${queryParams}): Int
  engageMessageDetail(_id: String): EngageMessage
  engageMessageCounts(name: String!, kind: String, status: String): JSON
  engagesConfigDetail: JSON
  engageMembers(isVerified: Boolean, ${GQL_CURSOR_PARAM_DEFS}): EngageMemberListResponse
  engageReportsList(page: Int, perPage: Int, customerId: String, status: String, searchValue: String): EngageDeliveryReport
  engageEmailPercentages: AvgEmailStats
  engageSmsDeliveries(type: String!, to: String, page: Int, perPage: Int): DeliveryList
`;

const mutationParams = `
  title: String
  kind: String
  method: String
  fromUserId: String

  targetType: String
  targetIds: [String]
  targetCount: Int

  isDraft: Boolean
  isLive: Boolean

  email: EngageMessageEmail
  messenger: EngageMessageMessenger
  notification: EngageMessageNotification
`;

export const mutations = `
  engageMessageAdd(${mutationParams}): EngageMessage
  engageMessageEdit(_id: String!, ${mutationParams}): EngageMessage
  engageMessageRemove(_ids: [String]): JSON
  engageMessageSetLive(_id: String!): EngageMessage
  engageMessageSetPause(_id: String!): EngageMessage
  engageMessageSetLiveManual(_id: String!): EngageMessage
  engagesUpdateConfigs(configsMap: JSON!): JSON
  engageMessageVerifyEmail(email: String!): String
  engageMessageRemoveVerifiedEmail(email: String!): String
  engageMessageSendTestEmail(from: String!, to: String!, content: String!, title: String!): String
  engageMessageCopy(_id: String!): EngageMessage

  engageSendMail(
    integrationId: String
    conversationId: String
    subject: String!
    body: String
    to: [String]!
    cc: [String]
    bcc: [String]
    from: String!
    shouldResolve: Boolean
    shouldOpen: Boolean
    headerId: String
    replyTo: [String]
    inReplyTo: String
    threadId: String
    messageId: String
    replyToMessageId: String
    references: [String]
    attachments: [JSON]
    customerId: String
  ): JSON
`;
