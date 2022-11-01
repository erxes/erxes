export const types = `

  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  enum NotificationType {
    system
    engage
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
  clientPortalNotificationCounts: Int
  clientPortalNotificationDetail(_id: String!): ClientPortalNotification
`;

export const mutations = `
  clientPortalNotificationsMarkAsRead (_ids: [String]) : JSON
  clientPortalNotificationsRemove(_ids: [String]) : JSON
`;
