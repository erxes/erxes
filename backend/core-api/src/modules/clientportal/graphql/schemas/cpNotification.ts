import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type CPNotification {
    _id: String!
    cpUserId: String!
    clientPortalId: String!
    title: String!
    message: String!
    type: String!
    contentType: String
    contentTypeId: String
    isRead: Boolean!
    readAt: Date
    priority: String!
    priorityLevel: Int!
    metadata: JSON
    action: String
    kind: String!
    createdAt: Date!
    expiresAt: Date
    updatedAt: Date!
  }

  type CPNotificationListResponse {
    list: [CPNotification]
    totalCount: Int
    pageInfo: PageInfo
  }

  enum CPNotificationPriority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  enum CPNotificationType {
    INFO
    SUCCESS
    WARNING
    ERROR
  }

  enum CPNotificationKind {
    SYSTEM
    USER
  }

  enum CPNotificationStatus {
    READ
    UNREAD
    ALL
  }

  input CPNotificationFilters {
    status: CPNotificationStatus
    priority: CPNotificationPriority
    type: CPNotificationType
    kind: CPNotificationKind
    fromDate: String
    endDate: String
  }
`;

const CP_NOTIFICATIONS_QUERIES_PARAMS = `
    ${GQL_CURSOR_PARAM_DEFS}
    status: CPNotificationStatus,
    priority: CPNotificationPriority,
    type: CPNotificationType,
    kind: CPNotificationKind,
    fromDate: String,
    endDate: String
`;

export const queries = `
    clientPortalNotifications(${CP_NOTIFICATIONS_QUERIES_PARAMS}, clientPortalId: String): CPNotificationListResponse
    clientPortalNotificationDetail(_id: String!): CPNotification
    clientPortalUnreadNotificationCount(clientPortalId: String): Int
`;

export const mutations = `
    clientPortalMarkNotificationAsRead(_id: String!): JSON
    clientPortalMarkAllNotificationsAsRead(clientPortalId: String): JSON
`;

export default { queries, mutations, types };
