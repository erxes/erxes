import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  enum CPNotificationType {
    system
    engage
  }

  type CPNotificationConfig {
    notifType: String
    label: String
    isAllowed: Boolean
  }

  type UserNotificationSettings {
    receiveByEmail: Boolean
    receiveBySms: Boolean
    configs: [CPNotificationConfig]
  }

  type ClientPortalNotification {
    _id: String!
    notifType: CPNotificationType
    title: String
    link: String
    content: String
    createdUser: User
    receiver: String
    createdAt: Date
    isRead: Boolean
    clientPortalId: String
    eventData: JSON
  }

  type ClientPortalNotificationListResponse {
    list: [ClientPortalNotification]
    totalCount: Int
    pageInfo: PageInfo
  }
`;

const params = `
${GQL_CURSOR_PARAM_DEFS}
  requireRead: Boolean,
  notifType: CPNotificationType
  search: String
  startDate: String
  endDate: String,
  eventDataFilter: EventDataFilter
`;

export const inputs = `
  input NotificationConfigInput {
    notifType: String
    label: String
    isAllowed: Boolean
  }
    
input MobileFireBaseConfig {
    sound: String
    channelId: String
  }

  input EventDataFilter {
    field: String,
    values: [String]
  }
`;

export const queries = `
  clientPortalNotifications(${params}): ClientPortalNotificationListResponse
  clientPortalNotificationCount(all: Boolean): Int
  clientPortalNotificationDetail(_id: String!): ClientPortalNotification
`;

export const mutations = `
  clientPortalNotificationsMarkAsRead (_ids: [String], markAll: Boolean) : String
  clientPortalNotificationsRemove(_ids: [String]) : JSON

  clientPortalUserUpdateNotificationSettings(
    receiveByEmail: Boolean,
    receiveBySms: Boolean,
    configs: [NotificationConfigInput],
  ): ClientPortalUser

  clientPortalSendNotification(receivers: [String], title: String, content: String, isMobile: Boolean, eventData: JSON, mobileConfig: MobileFireBaseConfig): JSON
`;
