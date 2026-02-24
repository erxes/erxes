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

  type EmailDelivery {
    _id: String
    notificationId: String
    userId: String
    email: String
    subject: String
    content: String
    provider: String
    messageId: String
    status: String
    sentAt: String
    error: String
    retryCount: Int
    createdAt: String
    updatedAt: String
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
  fromUserId:String
`;

export const queries = `
  pluginsNotifications: [NotificationPluginType]
  notifications(${GQL_CURSOR_PARAM_DEFS},${NOTIFICATIONS_QUERIES_PARAMS}):NotificationsList
  notificationDetail(_id:String!):Notification
  unreadNotificationsCount:Int
  notificationSettings: NotificationSettings
`;

export const mutations = `
  archiveNotification(_id:String!):String
  archiveNotifications(ids:[String], archiveAll:Boolean, filters:NotificationFilters):String
  markNotificationAsRead(_id:String!):JSON
  markAsReadNotifications(${NOTIFICATIONS_QUERIES_PARAMS}):JSON

  updateNotificationSettingsEvent(input: NotificationSettingsEventInput):JSON
  updateNotificationSettingsChannel(input: NotificationSettingsChannelInput):JSON
`;

export default { queries, mutations, types };
