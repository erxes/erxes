import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `

type NotificationModuleType {
    name:String,
    text:String
}

type NotificationModule {
    name:String,
    description:String,
    icon:String,
    types:[NotificationModuleType]
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
    notifications(${GQL_CURSOR_PARAM_DEFS},${NOTIFICATIONS_QUERIES_PARAMS}):NotificationsList
    notificationDetail(_id:String!):Notification
    unreadNotificationsCount:Int
`;

export const mutations = `
    markNotificationAsRead(_id:String!):JSON
    markAsReadNotifications(${NOTIFICATIONS_QUERIES_PARAMS}):JSON
`;

export default { queries, mutations, types };
