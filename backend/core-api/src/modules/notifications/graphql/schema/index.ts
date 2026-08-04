import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type NotificationModuleEvent {
    name:String,
    title:String,
    description:String
  }

  type NotificationModule {
    name:String,
    description:String,
    icon:String,
    events:[NotificationModuleEvent]
  }

  type NotificationPluginType {
    pluginName:String,
    modules:[NotificationModule]
  }

  type NotificationConfig {
    _id: String!
    contentType: String!
    action: String!
    enabled: Boolean!
    inAppEnabled: Boolean!
    emailEnabled: Boolean!
    emailTemplateId: String
    emailSubject: String
    expiresAfterDays: Int
    createdAt: Date
    updatedAt: Date
    createdBy: String!
  }

  type NotificationConfigListResponse {
    list: [NotificationConfig]
    totalCount: Int
  }

  type Notification {
    _id: String,
    title: String,
    message: String,
    type: String,
    fromUserId: String,
    fromUser:User,
    contentType: String,
    contentTypeId: String,
    priority: String,
    metadata: JSON,
    createdAt: Date,
    isRead: Boolean
    action:String
    emailDelivery:EmailDelivery
    kind:String
    updatedAt: Date
  }

  type NotificationsList {
    list:[Notification]
    totalCount: Int
    pageInfo: PageInfo
  }

  """
  One handover of a message to the email provider. Delivery events that arrive
  afterwards land in the arrays below, and stay empty for providers that push
  no webhooks.
  """
  type EmailDelivery {
    _id: String
    createdAt: Date
    updatedAt: Date

    from: String
    toEmails: [String]
    ccEmails: [String]
    subject: String
    content: String

    provider: String
    messageId: String
    providerResponse: String

    status: String
    sentAt: Date
    error: String
    rejected: [String]

    source: String
    sourceId: String
    userId: String
    notificationId: String

    deliveryStatus: String
    deliveryStatusAt: Date
    bounced: [String]
    complained: [String]
    opened: [String]
    clicked: [String]
  }

  type EmailAddress {
    _id: String
    email: String
    lane: String

    lastSentAt: Date
    lastDeliveredAt: Date
    deliveredCount: Int

    softBounceCount: Int
    lastSoftBounceAt: Date

    suppressedAt: Date
    suppressionReason: String
    suppressedBy: String

    releasedAt: Date
    releasedBy: String
    releaseNote: String

    createdAt: Date
    updatedAt: Date
  }

  type EmailRampStatus {
    tier: Int
    tiers: [Int]
    dailyBudget: Int
    usedToday: Int
    haltedAt: Date
    haltReason: String
    lastRate: Float
    lastEvaluatedAt: Date
    advanceRate: Float
    dropRate: Float
    haltRate: Float
    windowDays: Int
  }

  type EmailAddressesList {
    list:[EmailAddress]
    totalCount: Int
    pageInfo: PageInfo
  }

  type EmailDeliveriesList {
    list:[EmailDelivery]
    totalCount: Int
    pageInfo: PageInfo
  }

  type NotificationSettings {
    userId: String
    channels: JSON
    events: JSON

    createdAt: String
    updatedAt: String
  }

  enum NotificationPriority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  enum NotificationStatus {
    READ
    UNREAD
    ALL
  }

  enum NotificationType {
    INFO
    SUCCESS
    WARNING
    ERROR
  }

  input NotificationFilters {
    status:NotificationStatus,
    priority:NotificationPriority,
    type:NotificationType,
    fromDate:String,
    endDate:String,
    fromUserId:String
  }

  input NotificationSettingsEventInput {
    event: String,
    enabled: Boolean,
    channels: [String]
  }

  input NotificationSettingsChannelInput {
    channel: String,
    enabled: Boolean,
    metadata: JSON
  }
`;

const NOTIFICATIONS_QUERIES_PARAMS = `
  ids:[String],
  status:NotificationStatus,
  priority:NotificationPriority,
  type:NotificationType,
  fromDate:String,
  endDate:String,
  fromUserId:String,
  module:String
`;

const EMAIL_DELIVERIES_QUERY_PARAMS = `
  status:String,
  source:String,
  provider:String,
  searchValue:String,
  createdAtFrom:Date,
  createdAtTo:Date
`;

const EMAIL_ADDRESSES_QUERY_PARAMS = `
  lane:String,
  suppressionReason:String,
  searchValue:String,
  emails:[String]
`;

export const queries = `
  pluginsNotifications: [NotificationPluginType]
  notifications(${GQL_CURSOR_PARAM_DEFS},${NOTIFICATIONS_QUERIES_PARAMS}):NotificationsList
  notificationDetail(_id:String!):Notification
  unreadNotificationsCount:Int
  notificationSettings: NotificationSettings
  emailDeliveries(${GQL_CURSOR_PARAM_DEFS},${EMAIL_DELIVERIES_QUERY_PARAMS}):EmailDeliveriesList
  emailDeliveryDetail(_id:String!):EmailDelivery
  emailAddresses(${GQL_CURSOR_PARAM_DEFS},${EMAIL_ADDRESSES_QUERY_PARAMS}):EmailAddressesList
  emailRampStatus:EmailRampStatus
`;

export const mutations = `
  emailAddressRelease(email:String!, note:String!):String
  emailRampRelease(note:String!):EmailRampStatus
  archiveNotification(_id:String!):String
  archiveNotifications(ids:[String], archiveAll:Boolean, filters:NotificationFilters):String
  markNotificationAsRead(_id:String!):JSON
  markAsReadNotifications(${NOTIFICATIONS_QUERIES_PARAMS}):JSON

  updateNotificationSettingsEvent(input: NotificationSettingsEventInput):JSON
  updateNotificationSettingsChannel(input: NotificationSettingsChannelInput):JSON
`;

export default { queries, mutations, types };
