export const types = `

  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  enum NotificationType {
    system
    engage
  }

  type NotificationConfig {
    notifType: String
    label: String
    isAllowed: Boolean
  }

  input NotificationConfigInput {
    notifType: String
    label: String
    isAllowed: Boolean
  }

  type UserNotificationSettings {
    receiveByEmail: Boolean
    receiveBySms: Boolean
    configs: [NotificationConfig]
  }

  type ClientPortalNotification {
    _id: String!
    notifType: NotificationType
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
`;

const params = `
  limit: Int,
  page: Int,
  perPage: Int,
  requireRead: Boolean,
  notifType: NotificationType
  search: String
  startDate: String
  endDate: String
`;

export const queries = `
  clientPortalNotifications(${params}): [ClientPortalNotification]
  clientPortalNotificationCount: Int
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

    clientPortalSendNotification(receivers: [String], title: String, content: String, isMobile: Boolean, eventData: JSON): JSON
`;
