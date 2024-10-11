const externalId = "_id: String! @external";
const keyFields = '@key(fields: "_id")';

export const types = `
    extend type User ${keyFields} {
      ${externalId}
    }

    extend type Brand ${keyFields} {
      ${externalId}
    }


    extend type Segment ${keyFields} {
      ${externalId}
    }


    extend type Tag ${keyFields} {
      ${externalId}
    }

    extend type Customer ${keyFields} {
      ${externalId}
    }
    

    type EngageMessage ${keyFields} {
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

      brand: Brand

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
      fromUser: User
      fromIntegration: JSON
      createdUserName: String

      stats: JSON
      smsStats: JSON
      notificationStats: JSON
      logs: [EngageLog]
    }

    type EngageScheduleDate {
      type: String,
      month: String,
      day: String,
      dateTime: Date,
    }

    type DeliveryReport ${keyFields} {
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
      templateId: String
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

    input EngageMessageNotification {
      title: String!,
      content: String!,
      isMobile: Boolean,
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
  engageReportsList(page: Int, perPage: Int, customerId: String, status: String, searchValue: String): EngageDeliveryReport
  engageEmailPercentages: AvgEmailStats
  engageSmsDeliveries(type: String!, to: String, page: Int, perPage: Int): DeliveryList
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
  cpId: String,
  email: EngageMessageEmail,
  scheduleDate: EngageScheduleDateInput,
  messenger: EngageMessageMessenger,
  notification: EngageMessageNotification,
  shortMessage: EngageMessageSmsInput
  forceCreateConversation: Boolean
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
