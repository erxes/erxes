export const types = `

  extend type User @key(fields: "_id") {
    _id: String! @external
  }
  type ClientPortalNotification {
    _id: String!
    notifType: String
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
  notifType: String
  title: String
  startDate: String
  endDate: String
`;

export const queries = `
  clientPortalNotifications(${params}): [ClientPortalNotification]
  clientPortalNotificationCounts: Int
`;

export const mutations = `
  clientPortalNotificationsMarkAsRead (_ids: [String], contentTypeId: String) : JSON
  clientPortalNotificationsRemove(_ids: [String]) : JSON
`;
